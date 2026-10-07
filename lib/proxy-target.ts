export function validateTarget(value: string, ownHost = '') {
 const u = new URL(value);
 const host=u.hostname.toLowerCase();
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||(u.port&&!['80','443'].includes(u.port))||host===ownHost||!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/(^|\.)(localhost|local|internal|test|invalid|onion)$/.test(host))throw Error('Use a public HTTP or HTTPS website address.');
 return u;
}
export function isPublicIPv4(ip: string){const p=ip.split('.').map(Number);if(p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255))return false;const [a,b,c]=p;return !(a===0||a===10||a===127||a>=224||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||b===0||b===2))||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19||(b===51&&c===100)))||(a===203&&b===0&&c===113));}
export function relayLink(value: string, base: string){if(!value||value.startsWith('#'))return value;try{const u=validateTarget(new URL(value,base).href);return '/proxy?url='+encodeURIComponent(u.href)}catch{return '#'}}
