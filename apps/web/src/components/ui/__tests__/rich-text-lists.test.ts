import { describe, it, expect } from "vitest";
import { createEditor, $getRoot, type LexicalEditor } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, $isListNode, $isListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { richTextTheme } from "@/components/ui/rich-text-editor";
import { markNestedListItems, sanitizeHtml } from "@/lib/sanitize";

/** Editor real de Lexical montado en jsdom con el mismo tema que la app. */
function mount(html: string): { editor: LexicalEditor; root: HTMLElement } {
  const root = document.createElement("div");
  root.contentEditable = "true";
  document.body.append(root);
  const editor = createEditor({ nodes: [HeadingNode, ListNode, ListItemNode], theme: richTextTheme, onError: (e) => { throw e; } });
  editor.setRootElement(root);
  editor.update(() => {
    const dom = new DOMParser().parseFromString(html, "text/html");
    $getRoot().clear().append(...$generateNodesFromDOM(editor, dom));
  }, { discrete: true });
  return { editor, root };
}

const exportHtml = (editor: LexicalEditor) => editor.read(() => $generateHtmlFromNodes(editor));

// Lo que pegó el instructor: lista numerada con viñetas debajo de cada punto.
const LECCION = "<ol><li>Buyer persona:<ul><li>Qué es</li><li>Cómo definirlo</li></ul></li><li>Cómo llegar a los clientes:<ul><li>Marketing</li></ul></li></ol>";

describe("listas anidadas en el editor", () => {
  it("el <li> que envuelve la sublista no pinta número: no se repite el 2 ni el 3", () => {
    const { root } = mount(LECCION);
    const top = [...root.querySelectorAll(":scope > ol > li")] as HTMLLIElement[];
    const wrappers = top.filter((li) => li.firstElementChild?.tagName === "UL");
    expect(wrappers).toHaveLength(2);
    for (const li of wrappers) expect(li.classList.contains("rte-nested-item")).toBe(true);
    // Los puntos con texto conservan 1 y 2, y no llevan la clase.
    const items = top.filter((li) => !wrappers.includes(li));
    expect(items.map((li) => li.value)).toEqual([1, 2]);
    for (const li of items) expect(li.classList.contains("rte-nested-item")).toBe(false);
  });

  it("aumentar sangría convierte el punto en sublista del anterior, y quitarla lo regresa", () => {
    const { editor, root } = mount("<ol><li>Uno</li><li>Dos</li><li>Tres</li></ol>");
    const second = () => {
      const list = $getRoot().getFirstChildOrThrow();
      if (!$isListNode(list)) throw new Error("sin lista");
      const item = list.getChildren()[1];
      if (!$isListItemNode(item)) throw new Error("sin item");
      return item;
    };
    editor.update(() => { second().setIndent(1); }, { discrete: true });
    expect(root.querySelectorAll(":scope > ol > li.rte-nested-item > ol > li")).toHaveLength(1);
    expect(sanitizeHtml(exportHtml(editor)).replace(/\s+/g, " ")).toMatch(/Uno<\/span><ol[^>]*><li[^>]*><span[^>]*>Dos/);

    editor.update(() => {
      const nested = second().getFirstChildOrThrow();
      if (!$isListNode(nested)) throw new Error("sin sublista");
      const item = nested.getFirstChildOrThrow();
      if ($isListItemNode(item)) item.setIndent(0);
    }, { discrete: true });
    expect(root.querySelectorAll(":scope > ol > li")).toHaveLength(3);
    expect(root.querySelector(".rte-nested-item")).toBeNull();
  });

  it("guardar y volver a abrir la lección conserva la estructura", () => {
    const first = sanitizeHtml(exportHtml(mount(LECCION).editor));
    const second = sanitizeHtml(exportHtml(mount(first).editor));
    expect(second).toBe(first);
    expect((first.match(/<ul/g) ?? []).length).toBe(2);
  });
});

describe("markNestedListItems (contenido publicado)", () => {
  it("marca solo el <li> que arranca con una lista", () => {
    expect(markNestedListItems("<ol><li><ul><li>a</li></ul></li></ol>")).toBe('<ol><li class="rte-nested-item"><ul><li>a</li></ul></li></ol>');
    expect(markNestedListItems('<ol><li class="x">\n <ol><li>a</li></ol></li></ol>')).toContain('<li class="rte-nested-item x">');
  });

  it("no toca un punto con texto y sublista, ni marca dos veces", () => {
    const html = "<ol><li>Texto<ul><li>a</li></ul></li></ol>";
    expect(markNestedListItems(html)).toBe(html);
    const once = markNestedListItems("<ul><li><ul><li>a</li></ul></li></ul>");
    expect(markNestedListItems(once)).toBe(once);
  });
});
