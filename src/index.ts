const sizes: Record<string, NonNullable<RequestInitCfProperties["image"]>> = {
  thumb: { width: 150, height: 150, fit: "cover" },
  xs: { width: 300, fit: "scale-down" },
  sm: { width: 600, fit: "scale-down" },
  md: { width: 840, fit: "scale-down" },
  lg: { width: 1080, fit: "scale-down" },
  xl: { width: 1200, fit: "scale-down" },
  orig: {}
};

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const accept = request.headers.get("accept");

    const filePath = `https://${env.S3_ENDPOINT}/${env.S3_BUCKET}${pathname}`;
    const req = new Request(filePath, {
      headers: request.headers
    });

    let cf: RequestInitCfProperties = {};

    if (/^\/images\//.test(pathname)) {
      let image: NonNullable<RequestInitCfProperties["image"]> = {
        quality: 90,
        metadata: "none",
        format: "jpeg"
      };

      if (accept) {
        if (/image\/avif/.test(accept)) image.format = "avif";
        else if (/image\/webp/.test(accept)) image.format = "webp";
      }

      const size = url.searchParams.get("size");
      if (size && sizes[size]) {
        image = { ...image, ...sizes[size] };
      }

      cf.image = image;
    }

    return fetch(req, { cf });
  }
};
