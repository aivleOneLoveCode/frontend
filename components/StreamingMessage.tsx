import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StreamingMessageProps {
  content: string;
  onComplete?: () => void;
}

export function StreamingMessage({ content, onComplete }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (content.length === 0) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, 30); // 30ms 간격으로 한 글자씩 표시

    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <div className="relative">
      <span className="whitespace-pre-wrap leading-relaxed">
        {displayedContent}
      </span>
      {!isComplete && (
        <motion.span
          className="inline-block w-2 h-5 bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}