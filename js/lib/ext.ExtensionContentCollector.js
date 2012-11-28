"use strict";

var Collector = require( './ext.util.TokenAndAttrCollector.js' ).TokenAndAttrCollector,
	Util = require( './mediawiki.Util.js' ).Util,
	$ = require( 'jquery' );

// List of supported extensions
var supportedExtensions = ['math', 'gallery', 'source', 'tag'];

/**
 * Simple token collector for extensions
 */
function ExtensionContent ( manager, options ) {
	this.manager = manager;
	this.options = options;
	for (var i = 0; i < supportedExtensions.length; i++) {
		var ext = supportedExtensions[i];
		new Collector(
			manager,
			this.handleExtensionTag.bind(this, ext),
			true, // match the end-of-input if closing tag is missing
			// *NEVER* register several independent transformers with the
			// same rank, as deregistration will *not* work otherwise.
			// This gives us a few thousand extensions.
			this.rank + i * 0.00001,
			ext);
	}
}

ExtensionContent.prototype.rank = 0.04;

function defaultNestedDelimiterHandler(tokens, nestedDelimiterInfo) {
	// Always clone the container token before modifying it
	var token = nestedDelimiterInfo.token.clone();
	var i = nestedDelimiterInfo.attrIndex;
	var delimiter = nestedDelimiterInfo.delimiter;

	// Strip the delimiter token wherever it is nested
	// and strip upto/from the delimiter depending on the
	// token type and where in the stream we are.
	if (delimiter.constructor === TagTk) {
		token.attribs.splice(i+1);
		if (nestedDelimiterInfo.k >= 0) {
			token.attribs[i].k.splice(nestedDelimiterInfo.k);
			token.attribs[i].ksrc = undefined;
		} else {
			token.attribs[i].v.splice(nestedDelimiterInfo.v);
			token.attribs[i].vsrc = undefined;
		}

		tokens.push(delimiter);
		tokens.push(token);
	} else { // stripUpto

		// Since we are stripping upto the delimiter,
		// change the token to a simple span.
		// SSS FIXME: For sure in the case of table tags (tr,td,th,etc.) but, always??
		token.name = 'span';
		token.attribs.splice(0, i);
		if (nestedDelimiterInfo.k >= 0) {
			token.attribs[0].k.splice(0, nestedDelimiterInfo.k);
			token.attribs[0].ksrc = undefined;
		} else {
			token.attribs[0].v.splice(0, nestedDelimiterInfo.v);
			token.attribs[0].vsrc = undefined;
		}

		tokens.push(token);
		tokens.push(delimiter);
	}
}

ExtensionContent.prototype.handleExtensionTag = function(extension, collection) {
	function wrappedExtensionContent(env, tagTsr, contentTsr) {
		var text = env.text,
			nt = new TagTk('span', [
				new KV('typeof', 'mw:Object/Extension'),
				new KV('about', "#" + env.newObjectId())
			], {
				tsr: [tagTsr[0], tagTsr[1]],
				src: text.substring(tagTsr[0], tagTsr[1])
			});

		var content = contentTsr ? text.substring(contentTsr[0], contentTsr[1]) : '';
		return { tokens: [nt, content, new EndTagTk('span')] };
	}

	var tokens = [], start = collection.start, end = collection.end;

	// Handle self-closing tag case specially!
	if (start.constructor === SelfclosingTagTk) {
		var tsr = (start.dataAttribs || {}).tsr;
		if (tsr) {
			return wrappedExtensionContent(this.manager.env, tsr, null);
		} else {
			return { tokens: [start] };
		}
	}

	// Deal with nested opening delimiter found in another token
	if (start.constructor !== TagTk) {
		defaultNestedDelimiterHandler(tokens, start);
	} else {
		tokens.push(start);
	}

	tokens = tokens.concat(collection.tokens);

	// Deal with nested closing delimiter found in another token
	if (end && end.constructor !== EndTagTk) {
		defaultNestedDelimiterHandler(tokens, end);
	} else if (end) {
		tokens.push(end);
	}

	// We can only use tsr if we are the top-level
	// since env. only stores top-level wikitext and
	// not template wikitext.
	if (this.options.wrapTemplates && tokens.length > 1) {
		// Discard tokens and just create a span with text content
		// with span typeof set to mw:Object/Extension/Content
		var st = tokens[0],
			et = tokens.last(),
			sTsr = (st.dataAttribs || {}).tsr,
			eTsr = (et.dataAttribs || {}).tsr;

		// Dont crash if we dont get tsr values
		// FIXME: Just a temporary patch-up to prevent crashers in RT testing.
		if (sTsr && eTsr) {
			return wrappedExtensionContent(this.manager.env,
				[sTsr[0], eTsr[1]],
				[sTsr[1], eTsr[0]]);
		}
	}

	return { tokens: tokens };
};

if (typeof module === "object") {
	module.exports.ExtensionContent = ExtensionContent;
}