import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "../../playground/markdown.tsx";

const html = (text: string) => renderToStaticMarkup(<Markdown text={text} />);

describe("Markdown", () => {
  it("renders bold, lists and line breaks", () => {
    expect(html("**Your order:**\n- T-shirt x2\n- Cap\n\n1. Pay\n2. Ship\n\nThanks\nBye")).toBe(
      "<p><strong>Your order:</strong></p><ul><li>T-shirt x2</li><li>Cap</li></ul>" +
        "<ol><li>Pay</li><li>Ship</li></ol><p>Thanks<br/>Bye</p>",
    );
  });

  it("shows HTML as text", () => {
    expect(html('<img src=x onerror="alert(1)">')).toBe(
      "<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>",
    );
  });
});
