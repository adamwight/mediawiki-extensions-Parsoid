/**
 * Parsoid-specific configuration. We'll use this object to configure
 * interwiki regexes, mostly.
 */

var wikipedias = "en|de|fr|nl|it|pl|es|ru|ja|pt|zh|sv|vi|uk|ca|no|fi|cs|hu|ko|fa|id|tr|ro|ar|sk|eo|da|sr|lt|ms|eu|he|sl|bg|kk|vo|war|hr|hi|et|az|gl|simple|nn|la|th|el|new|roa-rup|oc|sh|ka|mk|tl|ht|pms|te|ta|be-x-old|ceb|br|be|lv|sq|jv|mg|cy|lb|mr|is|bs|yo|an|hy|fy|bpy|lmo|pnb|ml|sw|bn|io|af|gu|zh-yue|ne|nds|ku|ast|ur|scn|su|qu|diq|ba|tt|my|ga|cv|ia|nap|bat-smg|map-bms|wa|kn|als|am|bug|tg|gd|zh-min-nan|yi|vec|hif|sco|roa-tara|os|arz|nah|uz|sah|mn|sa|mzn|pam|hsb|mi|li|ky|si|co|gan|glk|ckb|bo|fo|bar|bcl|ilo|mrj|fiu-vro|nds-nl|tk|vls|se|gv|ps|rue|dv|nrm|pag|koi|pa|rm|km|kv|udm|csb|mhr|fur|mt|wuu|lij|ug|lad|pi|zea|sc|bh|zh-classical|nov|ksh|or|ang|kw|so|nv|xmf|stq|hak|ay|frp|frr|ext|szl|pcd|ie|gag|haw|xal|ln|rw|pdc|pfl|krc|crh|eml|ace|gn|to|ce|kl|arc|myv|dsb|vep|pap|bjn|as|tpi|lbe|wo|mdf|jbo|kab|av|sn|cbk-zam|ty|srn|kbd|lo|ab|lez|mwl|ltg|ig|na|kg|tet|za|kaa|nso|zu|rmy|cu|tn|chr|got|sm|bi|mo|bm|iu|chy|ik|pih|ss|sd|pnt|cdo|ee|ha|ti|bxr|om|ks|ts|ki|ve|sg|rn|dz|cr|lg|ak|tum|fj|st|tw|ch|ny|ff|xh|ng|ii|cho|mh|aa|kj|ho|mus|kr|hz";

var ParsoidConfig = function ( localSettings ) {
	this.interwikiMap = {};

	var wplist = wikipedias.split( '|' );
	for ( var ix = 0; ix < wplist.length; ix++ ) {
		this.interwikiMap[wplist[ix]] = 'http://' + wplist[ix] + '.wikipedia.org/w';
	}

	this.interwikiRegexp = Object.keys( this.interwikiMap ).join( '|' );

	if ( localSettings && localSettings.setup ) {
		localSettings.setup( null, this );
	}
};

ParsoidConfig.prototype.setInterwiki = function ( prefix, wgScript ) {
	this.interwikiMap[prefix] = wgScript;
	if ( this.interwikiRegexp.match( '\\|' + prefix + '\\|' ) === null ) {
		this.interwikiRegexp += '|' + prefix;
	}
};

ParsoidConfig.prototype.removeInterwiki = function ( prefix ) {
	delete this.interwikiMap[prefix];
	this.interwikiRegexp = this.interwikiRegexp.replace(
		new RegExp( '\\|' + prefix + '\\|' ), '|' );
};

if (typeof module === "object") {
	module.exports.ParsoidConfig = ParsoidConfig;
}
