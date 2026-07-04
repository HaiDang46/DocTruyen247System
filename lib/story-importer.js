import JSZip from "jszip";

// Helper to slugify Vietnamese string
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to convert HTML string to clean text content
export function convertHtmlToText(htmlString) {
  if (typeof window === "undefined" || !window.DOMParser) {
    // If running in node/SSR environments without DOMParser
    // Just strip HTML tags using regex
    return htmlString
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Try to find paragraph elements first
  const pElements = doc.querySelectorAll("p");
  if (pElements.length > 0) {
    return Array.from(pElements)
      .map(p => p.textContent?.trim() ?? "")
      .filter(t => t.length > 0)
      .join("\n\n");
  }

  // If no <p> tags, look at divs
  const divElements = doc.querySelectorAll("div");
  if (divElements.length > 0) {
    // Collect child-less or simple text divs to avoid duplication
    const divTexts = Array.from(divElements)
      .filter(div => div.children.length === 0 || Array.from(div.children).every(c => c.tagName === "BR"))
      .map(div => {
        // replace <br> inside div with newline
        const clone = div.cloneNode(true);
        clone.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
        return clone.textContent?.trim() ?? "";
      })
      .filter(t => t.length > 0);
    
    if (divTexts.length > 0) {
      return divTexts.join("\n\n");
    }
  }

  // Replace <br> with newlines, then get textContent of the body
  const cloneBody = doc.body.cloneNode(true);
  cloneBody.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  return cloneBody.textContent?.trim() || "";
}

// Extract number from chapter title (e.g. "Chương 15: Con đường" -> 15)
export function extractChapterNumber(title, fallback) {
  const match = title.match(/(?:chương|chapter|tập|quyển|chuong|tap|quyen|part)\s+(\d+(?:\.\d+)?)/i);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  const numberMatch = title.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch && numberMatch[1]) {
    return parseFloat(numberMatch[1]);
  }
  return fallback;
}

// 1. Parser for single TXT file (Novel)
export function parseSingleTxt(content, fileName) {
  const lines = content.split(/\r?\n/);
  const storyTitle = fileName.replace(/\.txt$/i, "");
  
  let description = "";
  const chapters = [];
  
  const chapterRegex = /^\s*(chương|chapter|tập|quyển|chuong|tap|quyen|part)\s+(\d+)/i;
  
  let currentChapterTitle = "";
  let currentChapterLines = [];
  let isCollectingDescription = true;
  let descriptionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (chapterRegex.test(line)) {
      isCollectingDescription = false;
      
      if (currentChapterTitle || currentChapterLines.length > 0) {
        chapters.push({
          number: extractChapterNumber(currentChapterTitle || "Chương 1", chapters.length + 1),
          title: currentChapterTitle || `Chương ${chapters.length + 1}`,
          content: currentChapterLines.join("\n").trim(),
        });
      }
      
      currentChapterTitle = line;
      currentChapterLines = [];
    } else {
      if (isCollectingDescription) {
        if (line) descriptionLines.push(line);
      } else {
        currentChapterLines.push(lines[i]);
      }
    }
  }

  if (currentChapterTitle || currentChapterLines.length > 0) {
    chapters.push({
      number: extractChapterNumber(currentChapterTitle || "Chương 1", chapters.length + 1),
      title: currentChapterTitle || `Chương ${chapters.length + 1}`,
      content: currentChapterLines.join("\n").trim(),
    });
  }

  if (chapters.length === 0) {
    chapters.push({
      number: 1,
      title: "Chương 1",
      content: content.trim(),
    });
    description = "Truyện chữ nhập từ file đơn lẻ.";
  } else {
    description = descriptionLines.slice(0, 10).join("\n").trim() || "Truyện chữ tự động phân tích từ file TXT.";
  }

  return {
    title: storyTitle,
    author: "Khuyết Danh",
    description,
    type: "NOVEL",
    chapters,
  };
}

// Helper to resolve relative path
function resolvePath(base, relative) {
  const parts = base.split("/");
  parts.pop();
  const relParts = relative.split("/");
  for (const part of relParts) {
    if (part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

// 2. Parser for EPUB file
export async function parseEpubStory(file) {
  const zip = await JSZip.loadAsync(file);
  
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) {
    throw new Error("Không tìm thấy META-INF/container.xml - File EPUB không hợp lệ.");
  }
  
  const containerXml = await containerFile.async("text");
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "text/xml");
  const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");
  
  if (!opfPath) {
    throw new Error("Không tìm thấy tệp OPF trong container.xml.");
  }
  
  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error(`Không tìm thấy tệp OPF tại đường dẫn: ${opfPath}`);
  }
  
  const opfXml = await opfFile.async("text");
  const opfDoc = parser.parseFromString(opfXml, "text/xml");
  
  const title = opfDoc.querySelector("title, dc\\:title")?.textContent?.trim() || file.name.replace(/\.epub$/i, "");
  const author = opfDoc.querySelector("creator, dc\\:creator")?.textContent?.trim() || "Chưa rõ tác giả";
  const description = opfDoc.querySelector("description, dc\\:description")?.textContent?.trim() || "Truyện chữ nhập từ file EPUB.";
  
  const manifestItems = opfDoc.querySelectorAll("manifest > item");
  const manifestMap = new Map();
  manifestItems.forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) {
      manifestMap.set(id, href);
    }
  });
  
  const spineItemrefs = opfDoc.querySelectorAll("spine > itemref");
  const chapters = [];
  
  let chapterIndex = 1;
  for (let i = 0; i < spineItemrefs.length; i++) {
    const idref = spineItemrefs[i].getAttribute("idref");
    if (!idref) continue;
    
    const relativeHref = manifestMap.get(idref);
    if (!relativeHref) continue;
    
    const absoluteHref = resolvePath(opfPath, relativeHref);
    const htmlFile = zip.file(absoluteHref);
    
    if (htmlFile) {
      const htmlContent = await htmlFile.async("text");
      const htmlDoc = parser.parseFromString(htmlContent, "text/html");
      
      let chapterTitle = htmlDoc.querySelector("h1, h2, h3, title")?.textContent?.trim();
      if (!chapterTitle || chapterTitle.toLowerCase() === "untitled") {
        chapterTitle = `Chương ${chapterIndex}`;
      }
      
      const pElements = htmlDoc.querySelectorAll("p, div");
      let paragraphTexts = [];
      pElements.forEach((p) => {
        const text = p.textContent?.trim();
        if (text && p.children.length < 3) {
          paragraphTexts.push(text);
        }
      });
      
      let textBody = "";
      if (paragraphTexts.length > 0) {
        textBody = paragraphTexts.join("\n\n");
      } else {
        textBody = htmlDoc.body?.textContent?.trim() || "";
      }
      
      if (textBody.length > 100) {
        chapters.push({
          number: extractChapterNumber(chapterTitle, chapterIndex),
          title: chapterTitle,
          content: textBody,
        });
        chapterIndex++;
      }
    }
  }
  
  if (chapters.length === 0) {
    throw new Error("Không thể trích xuất được chương nào từ file EPUB này.");
  }
  
  return {
    title,
    author,
    description,
    type: "NOVEL",
    chapters,
  };
}

// 3. Parser for ZIP file (Novel files or Manga images)
export async function parseZipStory(file) {
  const zip = await JSZip.loadAsync(file);
  const allFiles = Object.values(zip.files).filter((f) => !f.dir && !f.name.startsWith("__MACOSX") && !f.name.includes(".DS_Store"));
  
  const imageRegex = /\.(jpe?g|png|webp)$/i;
  const txtRegex = /\.(txt|html|xhtml|htm)$/i;
  
  const imageFiles = allFiles.filter((f) => imageRegex.test(f.name));
  const txtFiles = allFiles.filter((f) => txtRegex.test(f.name));
  
  if (imageFiles.length > 0 && imageFiles.length >= txtFiles.length) {
    imageFiles.sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }));
    
    const images = await Promise.all(
      imageFiles.map(async (f) => {
        const blob = await f.async("blob");
        return {
          name: f.name.split("/").pop() ?? f.name,
          url: URL.createObjectURL(blob),
        };
      })
    );
    
    const storyTitle = file.name.replace(/\.(zip|cbz)$/i, "");
    
    const chapters = [
      {
        number: 1,
        title: "Chương 1",
        imageUrls: images.map((img) => img.url),
        imageNames: images.map((img) => img.name),
      }
    ];
    
    return {
      title: storyTitle,
      author: "Khuyết Danh",
      description: `Truyện tranh Manga nhập từ file ZIP/CBZ chứa ${images.length} trang ảnh.`,
      type: "MANGA",
      chapters,
    };
  } else {
    txtFiles.sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }));
    
    const chapters = [];
    let chapterIdx = 1;
    
    for (const txtFile of txtFiles) {
      let content = await txtFile.async("text");
      const nameWithoutExt = txtFile.name.split("/").pop()?.replace(/\.[^.]+$/, "") ?? txtFile.name;
      
      const fileExt = txtFile.name.split(".").pop()?.toLowerCase();
      if (fileExt === "html" || fileExt === "xhtml" || fileExt === "htm") {
        content = convertHtmlToText(content);
      }
      
      const parsed = parseSingleTxt(content, nameWithoutExt);
      
      if (parsed.chapters.length > 1) {
        for (const chap of parsed.chapters) {
          chapters.push({
            number: chap.number,
            title: chap.title,
            content: chap.content,
          });
        }
      } else {
        chapters.push({
          number: extractChapterNumber(nameWithoutExt, chapterIdx),
          title: nameWithoutExt,
          content: content.trim(),
        });
      }
      chapterIdx++;
    }
    
    return {
      title: file.name.replace(/\.zip$/i, ""),
      author: "Khuyết Danh",
      description: `Truyện chữ Novel nhập từ file ZIP chứa ${chapters.length} chương.`,
      type: "NOVEL",
      chapters,
    };
  }
}
