import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import striptags from "striptags";

function htmlToMarkdown(text) {
	unified()
		.use(rehypeParse)
		.use(rehypeRemark)
		.use(remarkStringify)
		.process(text, (err, newText) => {
			if (err) return;
			text = String(newText);
		});

	return text;
}

function markdownToHtml(text) {
	unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(text, (err, newText) => {
			if (err) return;
			newString = String(newText);
			text = newString;
		});

	return text;
}

export default {
	// Gmail.
	"mail\\.google\\.com": {
		send: (html) => {
			// Remove the initial empty line.
			html = html.replace(/^<p><br><\/p>$/, "").replace(/^<br>$/, "");

			return htmlToMarkdown(html);
		},
		receive: (md) => {
			const html = markdownToHtml(md);

			return (
				html
					// Add blockquote style.
					.replace(
						/<blockquote/g,
						'<blockquote style="margin: 0px 0px 0px 0.8ex; border-left: 1px solid rgb(204, 204, 204); padding-left: 1ex;"'
					)
			);
		},
	},

	// StackEdit.io
	"stackedit\\.io": {
		send: (text) => striptags(text),
		receive: (text) => text,
	},

	// WordPress.com (Gutenberg).
	"[a-z-]+\\.wordpress.com": {
		send: (html) => {
			return (
				htmlToMarkdown(html)
					// Reset empty block.
					.replace(/^.\n$/, "")
			);
		},
		receive: (md) => {
			return markdownToHtml(md);
		},
	},

	// Slack.
	"app\\.slack\\.com": {
		send: (text) =>
			text
				// Remove the initial empty line.
				.replace(/^<p><br><\/p>$/, "")
				// Replace the newlines.
				.replace(/<br><\/p>/g, "\n")
				.replace(/<\/p>/g, "\n")
				// Remove the initial <p> tags.
				.replace(/<p>/g, "")
				// Replace emojis.
				.replace(/<img.*?data-id="(:[\w]*:)".*?>/g, "$1")
				// Replace bold.
				.replace(/\b\*/g, "**")
				.replace(/\*\b/g, "**")
				// Replace mention.
				.replace(/<\/?ts-mention.*?>/g, "")
				// Replace quotes.
				.replace(/&gt;/g, ">"),
		receive: (text) =>
			text
				// Replace bold.
				.replace(/\*\*/g, "*"),
	},

	// Google Docs.
	"docs\\.google\\.com": {
		send: (text) => htmlToMarkdown(text),
		receive: (text) => markdownToHtml(text),
	},
};
