import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, seed } from "../prisma/seed.js";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:5433/postgres?connection_limit=1&pgbouncer=true";
process.env.AUTH_SECRET ??= "test-secret-do-not-use-in-production";
process.env.COOKIE_SECURE = "false";

const { createApp } = await import("../src/main.js");
const { default: request } = await import("supertest");

const PROPERTY = "patricia-modern-terrace-homestay";
const CHECK_IN = "2026-12-01";
const CHECK_OUT = "2026-12-04";

function http(application: INestApplication): Server {
  const server: unknown = application.getHttpServer();
  if (typeof server !== "object" || server === null || !("listen" in server)) {
    throw new Error("HTTP server is not ready");
  }
  return server as Server;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected a JSON object");
  }
  return value as Record<string, unknown>;
}

function jsonBody(response: { body: unknown }): Record<string, unknown> {
  return record(response.body);
}

function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected an array");
  }
  return value;
}

function text(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Expected a string");
  }
  return value;
}

function num(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error("Expected a number");
  }
  return value;
}

function bookingBody(overrides: Record<string, unknown> = {}) {
  return {
    propertySlug: PROPERTY,
    checkIn: CHECK_IN,
    checkOut: CHECK_OUT,
    guests: 2,
    firstName: "Amina",
    lastName: "Hassan",
    email: "amina@example.test",
    phone: "+60 12-111 2233",
    specialRequest: "Evening arrival",
    ...overrides,
  };
}

void describe("homestay API", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  before(async () => {
    app = await createApp();
    await app.init();
    prisma = app.get(PrismaService);
    await seed(prisma);
  });

  after(async () => {
    const users = await prisma.user.findMany({
      where: { email: { endsWith: "@example.test" } },
      select: { id: true },
    });
    const ids = users.map((user) => user.id);
    if (ids.length > 0) {
      await prisma.booking.deleteMany({ where: { userId: { in: ids } } });
      await prisma.auditLog.deleteMany({ where: { actorId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
    await app.close();
  });

  void it("reports a healthy database", async () => {
    const response = await request(http(app)).get("/api/v1/health").expect(200);
    const body = jsonBody(response);
    assert.equal(body.status, "ok");
    assert.equal(body.database, "up");
  });

  void it("registers, rejects a duplicate email, logs in, and loads the profile", async () => {
    const email = `guest.${Date.now()}@example.test`;
    const agent = request.agent(http(app));
    const created = await agent
      .post("/api/v1/auth/register")
      .send({ email, password: "correct-horse", firstName: "Amina", lastName: "Hassan", phone: "+60 12-111 2233" })
      .expect(201);
    const createdBody = jsonBody(created);
    assert.equal(createdBody.email, email);
    assert.equal(createdBody.role, "GUEST");
    assert.equal(createdBody.passwordHash, undefined);
    assert.match(created.headers["set-cookie"]?.[0] ?? "", /hbp_session=/);

    await agent
      .post("/api/v1/auth/register")
      .send({ email, password: "correct-horse", firstName: "Amina", lastName: "Hassan" })
      .expect(409);

    await request(http(app)).post("/api/v1/auth/login").send({ email, password: "wrong-password" }).expect(401);

    const me = await agent.get("/api/v1/auth/me").expect(200);
    assert.equal(jsonBody(me).email, email);

    const profile = await agent.get("/api/v1/me").expect(200);
    assert.equal(jsonBody(profile).firstName, "Amina");

    await agent.patch("/api/v1/me").send({ firstName: "Aminah", role: "ADMIN" }).expect(400);
    const updated = await agent.patch("/api/v1/me").send({ firstName: "Aminah" }).expect(200);
    const updatedBody = jsonBody(updated);
    assert.equal(updatedBody.firstName, "Aminah");
    assert.equal(updatedBody.role, "GUEST");

    await agent.post("/api/v1/auth/logout").expect(200);
    await agent.get("/api/v1/me").expect(401);
  });

  void it("walks a guest request through host review without trusting a client price", async () => {
    const email = `journey.${Date.now()}@example.test`;
    const guest = request.agent(http(app));
    await guest
      .post("/api/v1/auth/register")
      .send({ email, password: "correct-horse", firstName: "Amina", lastName: "Hassan", phone: "+60 12-111 2233" })
      .expect(201);

    const properties = await guest.get("/api/v1/properties?pageSize=50").expect(200);
    const catalog = jsonBody(properties);
    assert.ok(num(catalog.total) >= 15);
    const stay = list(catalog.items).map(record).find((item) => item.slug === PROPERTY);
    if (!stay) {
      throw new Error("Seeded property is missing");
    }
    assert.equal(stay.priceValue, 620);
    assert.equal(stay.currency, "MYR");
    assert.ok(Array.isArray(stay.amenities));
    assert.ok(list(stay.galleryImages).length > 0);

    await guest.get(`/api/v1/properties/${PROPERTY}`).expect(200);
    await guest.post("/api/v1/bookings").send(bookingBody({ guests: 9, email })).expect(400);
    await guest.post("/api/v1/bookings").send(bookingBody({ checkOut: CHECK_IN, email })).expect(400);
    await guest.post("/api/v1/bookings").send(bookingBody({ checkIn: "2020-01-01", checkOut: "2020-01-03", email })).expect(400);

    await guest.post("/api/v1/bookings").send(bookingBody({ email, estimatedTotal: 1 })).expect(400);
    const created = await guest.post("/api/v1/bookings").send(bookingBody({ email })).expect(201);
    const createdBody = jsonBody(created);
    assert.equal(createdBody.status, "REQUESTED");
    assert.equal(createdBody.nights, 3);
    assert.equal(createdBody.nightlyRate, 620);
    assert.equal(createdBody.estimatedTotal, 1860);
    assert.match(text(createdBody.reference), /^HBP-/);
    assert.equal(record(list(createdBody.history)[0]).newStatus, "REQUESTED");

    const listed = await guest.get("/api/v1/bookings").expect(200);
    assert.ok(list(jsonBody(listed).items).map(record).some((item) => item.reference === createdBody.reference));

    const detail = await guest.get(`/api/v1/bookings/${text(createdBody.reference)}`).expect(200);
    assert.equal(jsonBody(detail).bookingId, createdBody.bookingId);

    const admin = request.agent(http(app));
    await admin.post("/api/v1/auth/login").send({ email: DEV_ADMIN_EMAIL, password: DEV_ADMIN_PASSWORD }).expect(200);
    await guest.get("/api/v1/admin/bookings").expect(403);
    await request(http(app)).get("/api/v1/admin/bookings").expect(401);

    const reviewing = await admin
      .patch(`/api/v1/admin/bookings/${text(createdBody.reference)}/status`)
      .send({ status: "REVIEWING", note: "Checking the dates" })
      .expect(200);
    assert.equal(jsonBody(reviewing).status, "REVIEWING");

    const confirmed = await admin
      .patch(`/api/v1/admin/bookings/${text(createdBody.reference)}/status`)
      .send({ status: "CONFIRMED", note: "Approved" })
      .expect(200);
    const confirmedBody = jsonBody(confirmed);
    assert.equal(confirmedBody.status, "CONFIRMED");
    assert.deepEqual(
      list(confirmedBody.history).map((entry) => record(entry).newStatus),
      ["REQUESTED", "REVIEWING", "CONFIRMED"],
    );

    const guestView = await guest.get(`/api/v1/bookings/${text(createdBody.reference)}`).expect(200);
    assert.equal(jsonBody(guestView).status, "CONFIRMED");

    const other = request.agent(http(app));
    await other
      .post("/api/v1/auth/register")
      .send({ email: `other.${Date.now()}@example.test`, password: "correct-horse", firstName: "Other", lastName: "Guest" })
      .expect(201);
    await other.get(`/api/v1/bookings/${text(createdBody.reference)}`).expect(403);

    await other
      .post("/api/v1/bookings")
      .send(bookingBody({ email: "other-guest@example.test", checkIn: "2026-12-02", checkOut: "2026-12-06" }))
      .expect(409);
  });

  void it("prevents two overlapping confirmations from both succeeding", async () => {
    const admin = request.agent(http(app));
    await admin.post("/api/v1/auth/login").send({ email: DEV_ADMIN_EMAIL, password: DEV_ADMIN_PASSWORD }).expect(200);

    async function requestStay(tag: string) {
      const guest = request.agent(http(app));
      await guest.post("/api/v1/auth/register").send({
        email: `${tag}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.test`,
        password: "correct-horse",
        firstName: tag,
        lastName: "Guest",
      }).expect(201);
      const created = await guest
        .post("/api/v1/bookings")
        .send(bookingBody({ checkIn: "2027-01-10", checkOut: "2027-01-14", email: `${tag}@example.test` }))
        .expect(201);
      return text(jsonBody(created).reference);
    }

    const [first, second] = await Promise.all([requestStay("racea"), requestStay("raceb")]);
    const results = await Promise.all([
      admin.patch(`/api/v1/admin/bookings/${first}/status`).send({ status: "CONFIRMED" }),
      admin.patch(`/api/v1/admin/bookings/${second}/status`).send({ status: "CONFIRMED" }),
    ]);
    const statuses = results.map((result) => result.status).sort();
    assert.deepEqual(statuses, [200, 409]);
  });

  void it("lets a guest modify an open request and blocks a host-held night", async () => {
    const email = `edit.${Date.now()}@example.test`;
    const guest = request.agent(http(app));
    await guest.post("/api/v1/auth/register").send({
      email,
      password: "correct-horse",
      firstName: "Amina",
      lastName: "Hassan",
    }).expect(201);
    const created = await guest
      .post("/api/v1/bookings")
      .send(bookingBody({ email, checkIn: "2027-02-02", checkOut: "2027-02-05" }))
      .expect(201);
    const reference = text(jsonBody(created).reference);

    const modified = await guest
      .patch(`/api/v1/bookings/${reference}`)
      .send({ checkIn: "2027-02-03", checkOut: "2027-02-06", guests: 3 })
      .expect(200);
    const modifiedBody = jsonBody(modified);
    assert.equal(modifiedBody.guestCount, 3);
    assert.equal(modifiedBody.estimatedTotal, 1860);
    assert.equal(modifiedBody.status, "REQUESTED");

    const admin = request.agent(http(app));
    await admin.post("/api/v1/auth/login").send({ email: DEV_ADMIN_EMAIL, password: DEV_ADMIN_PASSWORD }).expect(200);
    await admin.post(`/api/v1/admin/properties/${PROPERTY}/blocks`).send({ date: "2027-03-01" }).expect(201);
    await guest
      .post("/api/v1/bookings")
      .send(bookingBody({ email, checkIn: "2027-03-01", checkOut: "2027-03-03" }))
      .expect(409);
    await admin.delete(`/api/v1/admin/properties/${PROPERTY}/blocks/2027-03-01`).expect(200);

    const declined = await admin
      .patch(`/api/v1/admin/bookings/${reference}/status`)
      .send({ status: "DECLINED", note: "Dates no longer work" })
      .expect(200);
    assert.equal(jsonBody(declined).status, "DECLINED");
    await guest.post(`/api/v1/bookings/${reference}/cancel`).send({}).expect(409);
  });
});
