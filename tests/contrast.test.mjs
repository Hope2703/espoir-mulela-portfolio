import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const css = fs.readFileSync("resources/css/app.css", "utf8");
const roots = [
    ...css.matchAll(/:root(?:\[data-theme="?dark"?\])?\s*\{([^}]+)\}/g),
];
const luminance = (hex) => {
    let s = hex.slice(1);
    if (s.length === 3) s = [...s].map((c) => c + c).join("");
    const rgb = s
        .match(/../g)
        .map((c) => parseInt(c, 16) / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
test("body, secondary copy, accent and buttons meet AA in both themes", () => {
    assert.equal(roots.length, 2);
    const report = [];
    for (const [i, root] of roots.entries()) {
        const tokens = Object.fromEntries(
            [...root[1].matchAll(/--([\w-]+):\s*(#[a-f0-9]{3,6})/g)].map(
                (m) => [m[1], m[2]],
            ),
        );
        for (const [front, back] of [
            ["foreground", "background"],
            ["muted", "background"],
            ["muted", "surface"],
            ["accent", "background"],
            ["accent-foreground", "accent"],
        ]) {
            const a = luminance(tokens[front]),
                b = luminance(tokens[back]),
                ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            assert.ok(
                ratio >= 4.5,
                `${i ? "dark" : "light"} ${front}/${back}: ${ratio}`,
            );
            report.push({
                theme: i ? "dark" : "light",
                front,
                back,
                ratio: Number(ratio.toFixed(2)),
            });
        }
    }
    fs.mkdirSync("artifacts", { recursive: true });
    fs.writeFileSync(
        "artifacts/contrast.json",
        JSON.stringify(report, null, 2),
    );
});
