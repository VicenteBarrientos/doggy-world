import { describe, expect, it } from "vitest";

import {
  calculateTargetDimensions,
  isHeicFormat,
  isSupportedPhotoFormat,
  MAX_PHOTO_DIMENSION,
} from "@/lib/client-photo";

describe("Client Photo Pipeline", () => {
  describe("calculateTargetDimensions", () => {
    it("scales down a 48 MP landscape camera image to MAX_PHOTO_DIMENSION while keeping aspect ratio", () => {
      // 4:3 48MP photo (8000 x 6000)
      const { width, height } = calculateTargetDimensions(8000, 6000, MAX_PHOTO_DIMENSION);
      expect(width).toBe(MAX_PHOTO_DIMENSION);
      expect(height).toBe(1350);
    });

    it("scales down a portrait orientation phone photo preserving aspect ratio", () => {
      // Portrait iPhone photo (3024 x 4032)
      const { width, height } = calculateTargetDimensions(3024, 4032, 1800);
      expect(height).toBe(1800);
      expect(width).toBe(1350);
    });

    it("keeps already small photos at their original dimensions without upscaling", () => {
      const { width, height } = calculateTargetDimensions(800, 600, MAX_PHOTO_DIMENSION);
      expect(width).toBe(800);
      expect(height).toBe(600);
    });

    it("handles 1:1 square photos properly", () => {
      const { width, height } = calculateTargetDimensions(4000, 4000, 1800);
      expect(width).toBe(1800);
      expect(height).toBe(1800);
    });
  });

  describe("isSupportedPhotoFormat", () => {
    it("accepts standard mobile photo formats (JPEG, PNG, WebP, HEIC)", () => {
      expect(
        isSupportedPhotoFormat(new File(["data"], "rocky.jpg", { type: "image/jpeg" })),
      ).toBe(true);
      expect(
        isSupportedPhotoFormat(new File(["data"], "luna.png", { type: "image/png" })),
      ).toBe(true);
      expect(
        isSupportedPhotoFormat(new File(["data"], "tango.webp", { type: "image/webp" })),
      ).toBe(true);
      expect(
        isSupportedPhotoFormat(new File(["data"], "bella.heic", { type: "image/heic" })),
      ).toBe(true);
      expect(
        isSupportedPhotoFormat(new File(["data"], "milo.heif", { type: "image/heif" })),
      ).toBe(true);
    });

    it("identifies supported extensions even if file.type is empty or generic binary", () => {
      expect(
        isSupportedPhotoFormat(new File(["data"], "cam_photo.HEIC", { type: "" })),
      ).toBe(true);
      expect(
        isSupportedPhotoFormat(new File(["data"], "cam_photo.JPG", { type: "application/octet-stream" })),
      ).toBe(true);
    });

    it("rejects non-image formats", () => {
      expect(
        isSupportedPhotoFormat(new File(["data"], "document.pdf", { type: "application/pdf" })),
      ).toBe(false);
      expect(
        isSupportedPhotoFormat(new File(["data"], "script.sh", { type: "text/plain" })),
      ).toBe(false);
    });
  });

  describe("isHeicFormat", () => {
    it("accurately detects HEIC / HEIF by MIME type or file extension", () => {
      expect(isHeicFormat(new File(["data"], "photo.heic", { type: "image/heic" }))).toBe(true);
      expect(isHeicFormat(new File(["data"], "photo.HEIF", { type: "image/heif" }))).toBe(true);
      expect(isHeicFormat(new File(["data"], "dog.heic", { type: "" }))).toBe(true);
      expect(isHeicFormat(new File(["data"], "dog.jpg", { type: "image/jpeg" }))).toBe(false);
    });
  });
});
