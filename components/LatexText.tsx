'use client';

import { useMemo } from 'react';
import katex from 'katex';

// ─── 类型 ────────────────────────────────────────────────────
type Segment =
    | { type: 'text'; content: string }
    | { type: 'inline'; content: string }
    | { type: 'block'; content: string };

// ─── 解析器 ──────────────────────────────────────────────────
// 支持 $$...$$ (block) 和 $...$ (inline)，转义 \$ 不视为分隔符
function parseLatex(text: string): Segment[] {
    const segments: Segment[] = [];
    // $$...$$ 优先匹配（block），再匹配 $...$ (inline)
    const regex = /\$\$([\s\S]*?)\$\$|\$((?:[^$\\]|\\.)*)\$/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            segments.push({ type: 'text', content: text.slice(last, match.index) });
        }
        if (match[1] !== undefined) {
            segments.push({ type: 'block', content: match[1] });
        } else {
            segments.push({ type: 'inline', content: match[2] });
        }
        last = match.index + match[0].length;
    }

    if (last < text.length) {
        segments.push({ type: 'text', content: text.slice(last) });
    }

    return segments;
}

// ─── 渲染单个 LaTeX 片段 ──────────────────────────────────────
function renderMath(content: string, displayMode: boolean): string {
    try {
        return katex.renderToString(content, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html',
        });
    } catch {
        return content;
    }
}

// ─── 组件 ────────────────────────────────────────────────────
interface LatexTextProps {
    /** 要渲染的文本，可含 $...$ 或 $$...$$ */
    text: string;
    className?: string;
    /** 用于包裹块级数学公式的容器 className */
    blockClassName?: string;
}

export function LatexText({ text, className, blockClassName }: LatexTextProps) {
    const segments = useMemo(() => parseLatex(text), [text]);

    return (
        <span className={className}>
            {segments.map((seg, i) => {
                if (seg.type === 'text') {
                    return <span key={i}>{seg.content}</span>;
                }
                const html = renderMath(seg.content, seg.type === 'block');
                if (seg.type === 'block') {
                    return (
                        <span
                            key={i}
                            className={blockClassName ?? 'block my-1'}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                }
                return (
                    <span
                        key={i}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            })}
        </span>
    );
}
