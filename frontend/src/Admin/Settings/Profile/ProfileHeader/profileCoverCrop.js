export const defaultCoverSize = { width: 1600, height: 128 };
export const initialCrop = { zoom: 1, horizontal: 50, vertical: 50 };

export function getCoverSize(banner) {
    if (!banner?.width || !banner?.height) return defaultCoverSize;
    const width = defaultCoverSize.width;
    return { width, height: Math.max(1, Math.round(width * banner.height / banner.width)) };
}

export function getCoverCrop(sourceWidth, sourceHeight, { zoom, horizontal, vertical }, coverSize) {
    const scale = Math.max(coverSize.width / sourceWidth, coverSize.height / sourceHeight) * zoom;
    const width = Math.max(coverSize.width, sourceWidth * scale);
    const height = Math.max(coverSize.height, sourceHeight * scale);
    return {
        width,
        height,
        left: (coverSize.width - width) * horizontal / 100,
        top: (coverSize.height - height) * vertical / 100,
    };
}
