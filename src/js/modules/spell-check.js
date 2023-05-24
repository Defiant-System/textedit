
// rewrite from; https://github.com/maheshmurag/bjspell/

let SpellCheck = {
	load(lang) {
		window.fetch(`/cdn/dict/${lang}.js`, { responseType: "text" })
			.then(resp => {
				let omit = `BJSpell.${lang}=`,
				    dText = resp.data.slice(omit.length),
					dObj = new Function("SpellCheck", `SpellCheck.dictionary=${dText}`).call({}, this);
				// console.log( this );

				// the name of dictionary
				this.dictionary.lang = lang;
				// reset spell check object
				this.dictionary.checked = {};
				this.dictionary.keys = Object.keys(this.dictionary.words);
			});
	},

	/** check a word, case insensitive
	 * @param  String a word to check if it is correct or not
	 * @return Boolean false if the word does not exist
	 */
	check(word) {
		let checked = this.dictionary.checked[word = word.toLowerCase()];
		return typeof checked === "boolean" ? checked : this.parse(word);
	},

	/** check a "lowercased" word in the dictionary
	 * @param  String a lowercase word to search in the dictionary
	 * @return Boolean false if the word does not exist
	 */
	parse(word) {
		let Dict = this.dictionary;
		if (/^[0-9]+$/.test(word)) return Dict.checked[word] = true;
		let result = !!Dict.words[word];
		if (!result) {
			let parsed = word,
				rules = Dict.rules.PFX,
				length = rules.length,
				i = 0,
				rule,
				str,
				seek,
				re,
				add;
			for(; i < length; i++) {
				rule = rules[i]; add = rule[0]; seek = rule[1]; re = rule[2];
				str = word.substr(0, seek.length);
				if (str === seek) {
					parsed = word.substring(str.length);
					if (add !== "0")
						parsed = add + parsed;
					result = !!Dict.words[parsed];
					break;
				}
			};
			if (!result && parsed.length) {
				let rules = Dict.rules.SFX,
					len = parsed.length,
					length = rules.length,
					i = 0;
				for(; i < length; i++) {
					rule = rules[i]; add = rule[0]; seek = rule[1]; re = rule[2];
					str = parsed.substring(len - seek.length);
					if (str === seek) {
						seek = parsed.substring(0, len - str.length);
						if (add !== "0")
							seek += add;
						if ((re === "." || new RegExp(re + "$").test(seek)) && Dict.words[seek]) {
							result = true;
							break;
						}
					}
				}
			}
		};
		return Dict.checked[word] = result;
	},

	/** basic/silly implementation of a suggestion - I will write something more interesting one day
	 * @param  String a word, generally bad, to look for a suggestion
	 * @param  Number an optional unsigned integer to retrieve N suggestions.
	 * @return Array a list of possibilities/suggestions
	 */
	suggest(word, many) {
		let words;
		if (typeof this.dictionary.words[word] === "string") {
			// not implemented yet, requires word classes parser
			words = [word];
		} else {
			let keys = this.dictionary.keys,
				length = keys.length,
				i = Math.abs(many) || 1,
				ceil, indexOf;
			word = word.toLowerCase();
			if (-1 === keys.indexOf(word)) {
				keys[length] = word;
			}
			keys.sort();
			indexOf = keys.indexOf(word);
			many = indexOf - ((i / 2) >> 0);
			ceil = indexOf + 1 + Math.ceil(i / 2);
			words = keys.slice(many, indexOf).concat(keys.slice(indexOf + 1, ceil));
			while (words.length < i && ++ceil < keys.length) {
				words[words.length] = keys[ceil];
			}
			if (length !== keys.length) {
				keys.splice(indexOf, 1);
			}
		};
		return words;
	}
};
