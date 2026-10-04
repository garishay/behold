# Run in the folder holding title-v1.png; writes title.png and title.jpg.
import numpy as np, cv2
from PIL import Image
orig = np.asarray(Image.open('title-v1.png').convert('RGB')).copy()
im = orig.copy()
lum = lambda a: 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
# 1. Square each arched opening: fill its rounded shoulders with its own colour, so its top is flat.
for x0, y0, x1, y1 in [(744, 298, 753, 312), (857, 284, 862, 298), (889, 277, 895, 297), (847, 323, 853, 336),
                       (730, 270, 736, 289), (761, 266, 768, 284), (748, 267, 753, 287), (780, 262, 785, 277)]:
    box = im[y0:y1 + 1, x0:x1 + 1].astype(float)
    dark = lum(box) < np.percentile(lum(box), 90) - 45
    rows = [np.where(dark[r])[0] for r in range(dark.shape[0])]
    widths = [(r.max() - r.min() + 1) if len(r) else 0 for r in rows]
    full = [i for i, w in enumerate(widths) if w >= max(widths) - 1]
    lo, hi = min(rows[i].min() for i in full), max(rows[i].max() for i in full)
    top, first = min(i for i, w in enumerate(widths) if w > 0), min(full)
    fill = np.median(box[first:first + 2, lo:hi + 1].reshape(-1, 3), axis=0).astype(np.uint8)
    for r in range(top, first):
        for c in range(lo, hi + 1):
            if not dark[r, c]:
                im[y0 + r, x0 + c] = fill
# 2. The pointed tower before the citadel's lower wall: the wall 40 px to its left cloned over it, the bushes kept.
x0, y0, x1, y1 = 765, 280, 779, 309
s = orig[y0:y1 + 1, x0:x1 + 1].astype(int)
keep = (s[..., 1] > s[..., 0] + 5) & (s[..., 1] > s[..., 2])
region = im[y0:y1 + 1, x0:x1 + 1]
region[~keep] = im[y0:y1 + 1, x0 - 40:x1 + 1 - 40][~keep]
# 3. The small gold spire against the far hills: painted out from its surroundings.
mask = np.zeros(im.shape[:2], np.uint8)
x0, y0, x1, y1 = 696, 276, 712, 290
s = orig[y0:y1 + 1, x0:x1 + 1].astype(int)
mask[y0:y1 + 1, x0:x1 + 1][s[..., 0] > s[..., 2] + 10] = 255
mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), 1)
im = cv2.cvtColor(cv2.inpaint(cv2.cvtColor(im, cv2.COLOR_RGB2BGR), mask, 4, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
# 4. The right edge, with the domed tower, trimmed: columns 0-895 kept.
im = im[:, :896]
Image.fromarray(im).save('title.png', optimize=True)
Image.fromarray(im).save('title.jpg', quality=90, optimize=True, subsampling=0)
