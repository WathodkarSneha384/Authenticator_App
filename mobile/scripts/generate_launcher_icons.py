"""Generate Android launcher icons from the datavsnus logo."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "Asset" / "datavsnus_logo.jpg"
RES = ROOT / "android" / "app" / "src" / "main" / "res"

NAVY = (15, 44, 87)  # #0F2C57

# Standard launcher icon sizes (px)
LAUNCHER = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Adaptive foreground canvas sizes (108dp @ each density)
FOREGROUND = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}


def fit_logo(canvas: int, padding_ratio: float = 0.12) -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    inner = int(canvas * (1 - padding_ratio * 2))
    logo.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    bg = Image.new("RGBA", (canvas, canvas), NAVY + (255,))
    x = (canvas - logo.width) // 2
    y = (canvas - logo.height) // 2
    bg.paste(logo, (x, y), logo if logo.mode == "RGBA" else None)
    return bg.convert("RGB")


def main() -> None:
    if not LOGO.exists():
        raise SystemExit(f"Logo not found: {LOGO}")

    for folder, size in LAUNCHER.items():
        out_dir = RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        icon = fit_logo(size, padding_ratio=0.10)
        icon.save(out_dir / "ic_launcher.png", "PNG", optimize=True)
        icon.save(out_dir / "ic_launcher_round.png", "PNG", optimize=True)
        print(f"  {folder}/ic_launcher.png  ({size}x{size})")

    for folder, size in FOREGROUND.items():
        out_dir = RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        fg = fit_logo(size, padding_ratio=0.18)
        fg.save(out_dir / "ic_launcher_foreground.png", "PNG", optimize=True)
        print(f"  {folder}/ic_launcher_foreground.png  ({size}x{size})")

    print("Done — launcher icons generated.")


if __name__ == "__main__":
    main()
