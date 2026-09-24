import cloudinaryLoader from "@/lib/cloudinary-loader";

describe("cloudinaryLoader", () => {
  it("rewrites migrated local paths to Cloudinary with f_auto q_auto and width", () => {
    const url = cloudinaryLoader({
      src: "/images/sutera-hero-staircase.jpg",
      width: 800,
      quality: 75,
    });
    expect(url).toContain("res.cloudinary.com/j8fnep3s/image/upload/");
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).toContain("w_800");
    expect(url).toContain("homestay-by-patricia/sutera-hero-staircase");
  });

  it("passes through external non-Cloudinary URLs", () => {
    const src = "https://images.unsplash.com/photo-abc?w=100";
    expect(cloudinaryLoader({ src, width: 200, quality: 75 })).toBe(src);
  });

  it("leaves unmapped local paths unchanged", () => {
    const src = "/images/does-not-exist-xyz.jpg";
    expect(cloudinaryLoader({ src, width: 200, quality: 75 })).toBe(src);
  });
});
