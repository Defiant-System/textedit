
// rewrite of https://github.com/thysultan/md.js
let turnup = (function() {
	let unicode = char => unicodes[char] || char,
		unicodes = {
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'&': '&amp;',
			'[': '&#91;',
			']': '&#93;',
			'(': '&#40;',
			')': '&#41;',
		},
		resc = /[<>&\(\)\[\]"']/g,
		XSSFilterRegExp = /<(script)[^\0]*?>([^\0]+?)<\/(script)>/gmi,
		XSSFilterTemplate = '&lt;$1&gt;$2&lt;/$3&gt;',
		XSSFilterInlineJSRegExp = /(<.*? [^\0]*?=[^\0]*?)(javascript:.*?)(.*>)/gmi,
		XSSFilterInlineJSTemplate = '$1#$2&#58;$3',
		XSSFilterImageRegExp = /<img([^\0]*?onerror=)([^\0]*?)>/gmi,
		XSSFilterImageTemplate = (m, g1, g2) => `<img ${g1 + g2.replace(resc, unicode)}>`,
		removeTabsRegExp = /^[\t ]+|[\t ]$/gm,
		htmlFilterRegExp = /(<.*>[\t ]*\n^.*)/gm,
		htmlFilterTemplate = (m, g1) => g1.replace(/^\n|$\n/gm, ''),
		cssFilterRegExp = /(<style>[^]*<\/style>)/gm,
		cssFilterTemplate = htmlFilterTemplate,
		eventsFilterRegExp = /(<[^]+?)(\bon\w+=.*?)(.*>)/gm,
		eventsFilterTemplate = '$1$3',
		blockQuotesRegExp = /^[ \t]*> (.*)/gm,
		blockQuotesTemplate = '<blockquote>$1</blockquote>',
		inlineCodeRegExp = /`([^`]+?)`/g,
		inlineCodeTemplate = (m, g1) => `<code>${g1.replace(resc, unicode)}</code>`,
		blockCodeRegExp = /```(.*)\n([^\0]+?)```(?!```)/gm,
		imagesRegExp = /!\[(.*)\]\((.*)\)/g,
		imagesTemplate = (m, g1, g2) => `<img src="${g2.replace(resc, unicode)}" alt="${g1.replace(resc, unicode)}">`,
		headingsRegExp = /^(#+) +(.*)/gm,
		headingsTemplate = (m, hash, content) => `<h${hash.length}>${content}</h${hash.length}>`,
		headingsCommonh2RegExp = /^([^\n\t ])(.*)\n----+/gm,
		headingsCommonh1RegExp = /^([^\n\t ])(.*)\n====+/gm,
		headingsCommonh1Template = '<h1>$1$2</h1>',
		headingsCommonh2Template = '<h2>$1$2</h2>',
		paragraphsRegExp = /^([^-><#\d\+\_\*\t\n\[\! \{])([^]*?)(|  )(?:\n\n)/gm,
		paragraphsTemplate = (m, g1, g2, g3) => `<p>${g1 + g2}</p>`+ g3 ? m + '\n<br>\n' : '\n',
		horizontalRegExp = /^.*?(?:---|\*\*\*|- - -|\* \* \*)/gm,
		horizontalTemplate = '<hr>',

		strongRegExp = /(?:\*\*)([^\*\n_]+?)(?:\*\*)/g,
		strongTemplate = '<strong>$1</strong>',

		emphasisRegExp = /(?:_)([^\*\n]+?)(?:_)/g,
		emphasisTemplate = '<em>$1</em>',

		strikeRegExp = /(?:~)([^~]+?)(?:~)/g,
		strikeTemplate = '<del>$1</del>',

		linksRegExp = /\[(.*?)\]\(([^\t\n ]*)(?:| "(.*)")\)+/gm,
		linksTemplate = (m, g1, g2, g3) => {
			let title = g3 ? ` title="${g3.replace(resc, unicode)}"` : '';
			return `<a href="${g2.replace(resc, unicode)}"${title}>${g1.replace(resc, unicode)}</a>`;
		},
		listUlRegExp1 = /^[\t ]*?(?:-|\+|\*) (.*)/gm,
		listUlRegExp2 = /(\<\/ul\>\n(.*)\<ul\>*)+/g,
		listUlTemplate = '<ul><li>$1</li></ul>',
		listOlRegExp1 = /^[\t ]*?(?:\d(?:\)|\.)) (.*)/gm,
		listOlRegExp2 = /(\<\/ol\>\n(.*)\<ol\>*)+/g,
		listOlTemplate = '<ol><li>$1</li></ol>',
		lineBreaksRegExp = /^\n\n+/gm,
		lineBreaksTemplate = '<br>',
		checkBoxesRegExp = /\[( |x)\]/g,
		checkBoxesTemplate = (m, g1) => '<input type="checkbox" disabled'+ (g1.toLowerCase() === 'x' ? ' checked' : '') +'>';

	/**
	 * markdown parser
	 * 
	 * @param  {string} markdown
	 * @return {string}
	 */
	function md(markdown) {
		if (!markdown) return '';
		let code = [],
			index = 0,
			length = markdown.length;
		// to allow matching trailing paragraphs
		if (markdown[length-1] !== '\n' && markdown[length-2] !== '\n') {
			markdown += '\n\n';
		}
		// format, removes tabs, leading and trailing spaces
		markdown = (
			markdown
				// collect code blocks and replace with placeholder
				// we do this to avoid code blocks matching the paragraph regexp
				.replace(blockCodeRegExp, function(match, lang, block) {
					let placeholder = '{code-block-'+index+'}',
						regex = new RegExp('{code-block-'+index+'}', 'g');
					code[index++] = {lang: lang, block: block.replace(resc, unicode), regex: regex};

					return placeholder;
				})
				// XSS script tags
				.replace(XSSFilterRegExp, XSSFilterTemplate)
				// XSS image onerror
				.replace(XSSFilterImageRegExp, XSSFilterImageTemplate)
				// filter events
				.replace(eventsFilterRegExp, eventsFilterTemplate)
				// tabs
				.replace(removeTabsRegExp, '')
				// blockquotes
				.replace(blockQuotesRegExp, blockQuotesTemplate)
				// images
				.replace(imagesRegExp, imagesTemplate)
				// headings
				.replace(headingsRegExp, headingsTemplate)
				// headings h1 (commonmark)
				.replace(headingsCommonh1RegExp, headingsCommonh1Template)
				// headings h2 (commonmark)
				.replace(headingsCommonh2RegExp, headingsCommonh2Template)
				// horizontal rule 
				.replace(horizontalRegExp, horizontalTemplate)
				// checkboxes
				.replace(checkBoxesRegExp, checkBoxesTemplate)
				// filter html
				.replace(htmlFilterRegExp, htmlFilterTemplate)
				// filter css
				.replace(cssFilterRegExp, cssFilterTemplate)
				// paragraphs
				.replace(paragraphsRegExp, paragraphsTemplate)
				// links
				.replace(linksRegExp, linksTemplate)
				// unorderd lists
				.replace(listUlRegExp1, listUlTemplate).replace(listUlRegExp2, '')
				// ordered lists
				.replace(listOlRegExp1, listOlTemplate).replace(listOlRegExp2, '')
				// strong
				.replace(strongRegExp, strongTemplate)
				// emphasis
				.replace(emphasisRegExp, emphasisTemplate)
				// strike through
				.replace(strikeRegExp, strikeTemplate)
				// line breaks
				.replace(lineBreaksRegExp, lineBreaksTemplate)
				// filter inline js
				.replace(XSSFilterInlineJSRegExp, XSSFilterInlineJSTemplate)
		);

		// replace code block placeholders
		for (let i = 0; i < index; i++) {
			let item = code[i],
				block = item.block.replace(/\t/g, "&#160;&#160;&#160;&#160;");
			markdown = markdown.replace(item.regex, match => `<code class="language-${item.lang}">${block}</code>`);
		}
		return markdown.trim();
	}

	return md;
})();
