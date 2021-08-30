import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

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
	"mail\\.google\\.com": {
		send: (text) => {
			// Remove the initial empty line.
			text = text.replace(/^<p><br><\/p>$/, "").replace(/^<br>$/, "");

			return htmlToMarkdown(text);
		},
		receive: (text) => markdownToHtml(text),
	},
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
	"docs\\.google\\.com": {
		send: (text) => htmlToMarkdown(text),
		receive: (text) => markdownToHtml(text),
	},
};
