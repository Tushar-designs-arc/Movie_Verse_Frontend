import { useEffect } from "react";

// Route screens own their document metadata so browser history and shared links reflect the current content.
const usePageMetadata = ({ title, description } = {}) => {
  useEffect(() => {
    const previousTitle = document.title;
    const existingDescription = document.querySelector('meta[name="description"]');
    const previousDescription = existingDescription?.content;
    let createdDescription = false;

    if (title) document.title = title;
    if (description !== undefined) {
      const descriptionTag = existingDescription || document.createElement("meta");
      if (!existingDescription) {
        descriptionTag.name = "description";
        document.head.appendChild(descriptionTag);
        createdDescription = true;
      }
      descriptionTag.content = description || "";
    }

    return () => {
      document.title = previousTitle;
      if (description !== undefined) {
        const descriptionTag = document.querySelector('meta[name="description"]');
        if (createdDescription) descriptionTag?.remove();
        else if (descriptionTag) descriptionTag.content = previousDescription || "";
      }
    };
  }, [description, title]);
};

export default usePageMetadata;