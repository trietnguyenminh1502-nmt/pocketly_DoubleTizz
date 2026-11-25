import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { normalizeBotText } from '@/utils/normalizeBotText';

export default function BotMessage({ content }) {
  return (
    <div className="chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {normalizeBotText(content)}
      </ReactMarkdown>
    </div>
  );
}

export { BotMessage };
