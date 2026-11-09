/*!
PMTiles 4.5.0
The below license (BSD-3) applies to the reference implementations in this repository.

The PMTiles specification itself is public domain, or CC0 where applicable.

Sample tilesets available in this repository are subject to their own license terms.

---

Copyright 2021 Protomaps LLC

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
fflate
MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var pmtiles=(()=>{var J=Object.defineProperty;var Ve=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames;var Ye=Object.prototype.hasOwnProperty;var Qe=(r,e)=>{for(var t in e)J(r,t,{get:e[t],enumerable:!0})},Xe=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Je(e))!Ye.call(r,i)&&i!==t&&J(r,i,{get:()=>e[i],enumerable:!(n=Ve(e,i))||n.enumerable});return r};var _e=r=>Xe(J({},"__esModule",{value:!0}),r);var Ct={};Qe(Ct,{Compression:()=>Ze,EtagMismatch:()=>H,FetchSource:()=>$e,FileSource:()=>Mt,PMTiles:()=>ee,Protocol:()=>Tt,ResolvedValueCache:()=>Ut,SharedPromiseCache:()=>Ge,TileType:()=>Fe,bytesToHeader:()=>ae,findTile:()=>ie,getUint64:()=>x,leafletRasterLayer:()=>xt,readVarint:()=>D,tileIdToZxy:()=>Ie,tileTypeExt:()=>ne,zxyToTileId:()=>re});var w=Uint8Array,I=Uint16Array,et=Int32Array,xe=new w([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),ze=new w([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),tt=new w([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Te=function(r,e){for(var t=new I(31),n=0;n<31;++n)t[n]=e+=1<<r[n-1];for(var i=new et(t[30]),n=1;n<30;++n)for(var a=t[n];a<t[n+1];++a)i[a]=a-t[n]<<5|n;return{b:t,r:i}},Ae=Te(xe,2),Me=Ae.b,rt=Ae.r;Me[28]=258,rt[258]=28;var Ue=Te(ze,0),nt=Ue.b,Et=Ue.r,X=new I(32768);for(v=0;v<32768;++v)U=(v&43690)>>1|(v&21845)<<1,U=(U&52428)>>2|(U&13107)<<2,U=(U&61680)>>4|(U&3855)<<4,X[v]=((U&65280)>>8|(U&255)<<8)>>1;var U,v,B=(function(r,e,t){for(var n=r.length,i=0,a=new I(e);i<n;++i)r[i]&&++a[r[i]-1];var s=new I(e);for(i=1;i<e;++i)s[i]=s[i-1]+a[i-1]<<1;var o;if(t){o=new I(1<<e);var h=15-e;for(i=0;i<n;++i)if(r[i])for(var f=i<<4|r[i],c=e-r[i],l=s[r[i]-1]++<<c,u=l|(1<<c)-1;l<=u;++l)o[X[l]>>h]=f}else for(o=new I(n),i=0;i<n;++i)r[i]&&(o[i]=X[s[r[i]-1]++]>>15-r[i]);return o}),O=new w(288);for(v=0;v<144;++v)O[v]=8;var v;for(v=144;v<256;++v)O[v]=9;var v;for(v=256;v<280;++v)O[v]=7;var v;for(v=280;v<288;++v)O[v]=8;var v,Ce=new w(32);for(v=0;v<32;++v)Ce[v]=5;var v;var it=B(O,9,1);var at=B(Ce,5,1),Y=function(r){for(var e=r[0],t=1;t<r.length;++t)r[t]>e&&(e=r[t]);return e},T=function(r,e,t){var n=e/8|0;return(r[n]|r[n+1]<<8)>>(e&7)&t},Q=function(r,e){var t=e/8|0;return(r[t]|r[t+1]<<8|r[t+2]<<16)>>(e&7)},st=function(r){return(r+7)/8|0},ot=function(r,e,t){return(e==null||e<0)&&(e=0),(t==null||t>r.length)&&(t=r.length),new w(r.subarray(e,t))};var lt=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],m=function(r,e,t){var n=new Error(e||lt[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,m),!t)throw n;return n},_=function(r,e,t,n){var i=r.length,a=n?n.length:0;if(!i||e.f&&!e.l)return t||new w(0);var s=!t,o=s||e.i!=2,h=e.i;s&&(t=new w(i*3));var f=function(de){var me=t.length;if(de>me){var we=new w(Math.max(me*2,de));we.set(t),t=we}},c=e.f||0,l=e.p||0,u=e.b||0,d=e.l,A=e.d,p=e.m,E=e.n,R=i*8;do{if(!d){c=T(r,l,1);var G=T(r,l+1,3);if(l+=3,G)if(G==1)d=it,A=at,p=9,E=5;else if(G==2){var K=T(r,l,31)+257,he=T(r,l+10,15)+4,fe=K+T(r,l+5,31)+1;l+=14;for(var Z=new w(fe),W=new w(19),z=0;z<he;++z)W[tt[z]]=T(r,l+z*3,7);l+=he*3;for(var ue=Y(W),ke=(1<<ue)-1,Ke=B(W,ue,1),z=0;z<fe;){var ce=Ke[T(r,l,ke)];l+=ce&15;var M=ce>>4;if(M<16)Z[z++]=M;else{var S=0,$=0;for(M==16?($=3+T(r,l,3),l+=2,S=Z[z-1]):M==17?($=3+T(r,l,7),l+=3):M==18&&($=11+T(r,l,127),l+=7);$--;)Z[z++]=S}}var ve=Z.subarray(0,K),C=Z.subarray(K);p=Y(ve),E=Y(C),d=B(ve,p,1),A=B(C,E,1)}else m(1);else{var M=st(l)+4,j=r[M-4]|r[M-3]<<8,k=M+j;if(k>i){h&&m(0);break}o&&f(u+j),t.set(r.subarray(M,k),u),e.b=u+=j,e.p=l=k*8,e.f=c;continue}if(l>R){h&&m(0);break}}o&&f(u+131072);for(var We=(1<<p)-1,qe=(1<<E)-1,q=l;;q=l){var S=d[Q(r,l)&We],b=S>>4;if(l+=S&15,l>R){h&&m(0);break}if(S||m(2),b<256)t[u++]=b;else if(b==256){q=l,d=null;break}else{var ge=b-254;if(b>264){var z=b-257,F=xe[z];ge=T(r,l,(1<<F)-1)+Me[z],l+=F}var N=A[Q(r,l)&qe],V=N>>4;N||m(3),l+=N&15;var C=nt[V];if(V>3){var F=ze[V];C+=Q(r,l)&(1<<F)-1,l+=F}if(l>R){h&&m(0);break}o&&f(u+131072);var pe=u+ge;if(u<C){var ye=a-C,Ne=Math.min(C,pe);for(ye+u<0&&m(3);u<Ne;++u)t[u]=n[ye+u]}for(;u<pe;++u)t[u]=t[u-C]}}e.l=d,e.p=q,e.b=u,e.f=c,d&&(c=1,e.m=p,e.d=A,e.n=E)}while(!c);return u!=t.length&&s?ot(t,0,u):t.subarray(0,u)};var ht=new w(0);var ft=function(r){(r[0]!=31||r[1]!=139||r[2]!=8)&&m(6,"invalid gzip data");var e=r[3],t=10;e&4&&(t+=(r[10]|r[11]<<8)+2);for(var n=(e>>3&1)+(e>>4&1);n>0;n-=!r[t++]);return t+(e&2)},ut=function(r){var e=r.length;return(r[e-4]|r[e-3]<<8|r[e-2]<<16|r[e-1]<<24)>>>0};var ct=function(r,e){return((r[0]&15)!=8||r[0]>>4>7||(r[0]<<8|r[1])%31)&&m(6,"invalid zlib data"),(r[1]>>5&1)==+!e&&m(6,"invalid zlib data: "+(r[1]&32?"need":"unexpected")+" dictionary"),(r[1]>>3&4)+2};function vt(r,e){return _(r,{i:2},e&&e.out,e&&e.dictionary)}function gt(r,e){var t=ft(r);return t+8>r.length&&m(6,"invalid gzip data"),_(r.subarray(t,-8),{i:2},e&&e.out||new w(ut(r)),e&&e.dictionary)}function pt(r,e){return _(r.subarray(ct(r,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}function Le(r,e){return r[0]==31&&r[1]==139&&r[2]==8?gt(r,e):(r[0]&15)!=8||r[0]>>4>7||(r[0]<<8|r[1])%31?vt(r,e):pt(r,e)}var yt=typeof TextDecoder!="undefined"&&new TextDecoder,dt=0;try{yt.decode(ht,{stream:!0}),dt=1}catch(r){}var mt=Object.defineProperty,wt=Math.pow,g=(r,e)=>mt(r,"name",{value:e,configurable:!0}),y=(r,e,t)=>new Promise((n,i)=>{var a=h=>{try{o(t.next(h))}catch(f){i(f)}},s=h=>{try{o(t.throw(h))}catch(f){i(f)}},o=h=>h.done?n(h.value):Promise.resolve(h.value).then(a,s);o((t=t.apply(r,e)).next())}),xt=g((r,e)=>{let t=!1,n="",i=L.GridLayer.extend({createTile:g((a,s)=>{let o=document.createElement("img"),h=new AbortController,f=h.signal;return o.cancel=()=>{h.abort()},t||(r.getHeader().then(c=>{c.tileType===1||c.tileType===6?console.error("Error: archive contains vector tiles, but leafletRasterLayer is for displaying raster tiles. See https://github.com/protomaps/PMTiles/tree/main/js for details."):c.tileType===2?n="image/png":c.tileType===3?n="image/jpeg":c.tileType===4?n="image/webp":c.tileType===5&&(n="image/avif")}),t=!0),r.getZxy(a.z,a.x,a.y,f).then(c=>{if(c){let l=new Blob([c.data],{type:n}),u=window.URL.createObjectURL(l);o.src=u}else o.style.display="none";o.cancel=void 0,s(void 0,o)}).catch(c=>{if(c.name!=="AbortError")throw c}),o},"createTile"),_removeTile:g(function(a){let s=this._tiles[a];s&&(s.el.cancel&&s.el.cancel(),s.el.src&&window.URL.revokeObjectURL(s.el.src),s.el.width=0,s.el.height=0,s.el.deleted=!0,L.DomUtil.remove(s.el),delete this._tiles[a],this.fire("tileunload",{tile:s.el,coords:this._keyToTileCoords(a)}))},"_removeTile")});return new i(e)},"leafletRasterLayer"),zt=g(r=>(e,t)=>{if(t instanceof AbortController)return r(e,t);let n=new AbortController;return r(e,n).then(i=>t(void 0,i.data,i.cacheControl||"",i.expires||""),i=>t(i)).catch(i=>t(i)),{cancel:g(()=>n.abort(),"cancel")}},"v3compat"),Ee=class{constructor(e){this.tilev4=g((t,n)=>y(this,null,function*(){if(t.type==="json"){let d=t.url.substr(10),A=this.tiles.get(d);if(A||(A=new ee(d),this.tiles.set(d,A)),this.metadata){let E=yield A.getTileJson(t.url);return n.signal.throwIfAborted(),{data:E}}let p=yield A.getHeader();return n.signal.throwIfAborted(),(p.minLon>=p.maxLon||p.minLat>=p.maxLat)&&console.error(`Bounds of PMTiles archive ${p.minLon},${p.minLat},${p.maxLon},${p.maxLat} are not valid.`),{data:{tiles:[`${t.url}/{z}/{x}/{y}`],minzoom:p.minZoom,maxzoom:p.maxZoom,bounds:[p.minLon,p.minLat,p.maxLon,p.maxLat]}}}let i=new RegExp(/pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/),a=t.url.match(i);if(!a)throw new Error("Invalid PMTiles protocol URL");let s=a[1],o=this.tiles.get(s);o||(o=new ee(s),this.tiles.set(s,o));let h=a[2],f=a[3],c=a[4],l=yield o==null?void 0:o.getZxy(+h,+f,+c,n.signal);if(n.signal.throwIfAborted(),l)return{data:new Uint8Array(l.data),cacheControl:l.cacheControl,expires:l.expires};let u=yield o.getHeader();if(u.tileType===1||u.tileType===6){if(this.errorOnMissingTile)throw new Error("Tile not found.");return{data:new Uint8Array}}return{data:null}}),"tilev4"),this.tile=zt(this.tilev4),this.tiles=new Map,this.metadata=(e==null?void 0:e.metadata)||!1,this.errorOnMissingTile=(e==null?void 0:e.errorOnMissingTile)||!1}add(e){this.tiles.set(e.source.getKey(),e)}get(e){return this.tiles.get(e)}};g(Ee,"Protocol");var Tt=Ee;function De(r,e){return(e>>>0)*4294967296+(r>>>0)}g(De,"toNum");function Se(r,e){let t=e.buf,n=t[e.pos++],i=(n&112)>>4;if(n<128||(n=t[e.pos++],i|=(n&127)<<3,n<128)||(n=t[e.pos++],i|=(n&127)<<10,n<128)||(n=t[e.pos++],i|=(n&127)<<17,n<128)||(n=t[e.pos++],i|=(n&127)<<24,n<128)||(n=t[e.pos++],i|=(n&1)<<31,n<128))return De(r,i);throw new Error("Expected varint not more than 10 bytes")}g(Se,"readVarintRemainder");function D(r){let e=r.buf,t=e[r.pos++],n=t&127;return t<128||(t=e[r.pos++],n|=(t&127)<<7,t<128)||(t=e[r.pos++],n|=(t&127)<<14,t<128)||(t=e[r.pos++],n|=(t&127)<<21,t<128)?n:(t=e[r.pos],n|=(t&15)<<28,Se(n,r))}g(D,"readVarint");function te(r,e,t,n,i){return i===0?n!==0?[r-1-t,r-1-e]:[t,e]:[e,t]}g(te,"rotate");function re(r,e,t){if(r>26)throw new Error("Tile zoom level exceeds max safe number limit (26)");if(e>=1<<r||t>=1<<r)throw new Error("tile x/y outside zoom level bounds");let n=((1<<r)*(1<<r)-1)/3,i=r-1,[a,s]=[e,t];for(let o=1<<i;o>0;o>>=1){let h=a&o,f=s&o;n+=(3*h^f)*(1<<i),[a,s]=te(o,a,s,h,f),i--}return n}g(re,"zxyToTileId");function be(r){let e=3*r+1;return e<4294967296?31-Math.clz32(e):63-Math.clz32(e/4294967296)}g(be,"tileIdToZ");function Ie(r){let e=be(r)>>1;if(e>26)throw new Error("Tile zoom level exceeds max safe number limit (26)");let t=((1<<e)*(1<<e)-1)/3,n=r-t,i=0,a=0,s=1<<e;for(let o=1;o<s;o<<=1){let h=o&n/2,f=o&(n^h);[i,a]=te(o,i,a,h,f),n=n/2,i+=h,a+=f}return[e,i,a]}g(Ie,"tileIdToZxy");var Ze=(r=>(r[r.Unknown=0]="Unknown",r[r.None=1]="None",r[r.Gzip=2]="Gzip",r[r.Brotli=3]="Brotli",r[r.Zstd=4]="Zstd",r))(Ze||{});function P(r,e){return y(this,null,function*(){if(e===1||e===0)return r;if(e===2){if(typeof globalThis.DecompressionStream=="undefined")return Le(new Uint8Array(r));let t=new Response(r).body;if(!t)throw new Error("Failed to read response stream");let n=t.pipeThrough(new globalThis.DecompressionStream("gzip"));return new Response(n).arrayBuffer()}throw new Error("Compression method not supported")})}g(P,"defaultDecompress");var Fe=(r=>(r[r.Unknown=0]="Unknown",r[r.Mvt=1]="Mvt",r[r.Png=2]="Png",r[r.Jpeg=3]="Jpeg",r[r.Webp=4]="Webp",r[r.Avif=5]="Avif",r[r.Mlt=6]="Mlt",r))(Fe||{});function ne(r){return r===1?".mvt":r===2?".png":r===3?".jpg":r===4?".webp":r===5?".avif":r===6?".mlt":""}g(ne,"tileTypeExt");var At=127;function ie(r,e){let t=0,n=r.length-1;for(;t<=n;){let i=n+t>>1,a=e-r[i].tileId;if(a>0)t=i+1;else if(a<0)n=i-1;else return r[i]}return n>=0&&(r[n].runLength===0||e-r[n].tileId<r[n].runLength)?r[n]:null}g(ie,"findTile");var Be=class{constructor(e){this.file=e}getKey(){return this.file.name}getBytes(e,t){return y(this,null,function*(){return{data:yield this.file.slice(e,e+t).arrayBuffer()}})}};g(Be,"FileSource");var Mt=Be,Oe=class{constructor(e,t=new Headers,n=void 0){var i,a;this.url=e,this.customHeaders=t,this.credentials=n,this.mustReload=!1;let s="";"navigator"in globalThis&&(s=(a=(i=globalThis.navigator)==null?void 0:i.userAgent)!=null?a:"");let o=s.indexOf("Windows")>-1,h=/Chrome|Chromium|Edg|OPR|Brave/.test(s);this.chromeWindowsNoCache=!1,o&&h&&(this.chromeWindowsNoCache=!0)}getKey(){return this.url}setHeaders(e){this.customHeaders=e}getBytes(e,t,n,i){return y(this,null,function*(){let a,s;n?s=n:(a=new AbortController,s=a.signal);let o=new Headers(this.customHeaders);o.set("range",`bytes=${e}-${e+t-1}`);let h;this.mustReload?h="reload":this.chromeWindowsNoCache&&(h="no-store");let f=yield fetch(this.url,{signal:s,cache:h,headers:o,credentials:this.credentials});if(e===0&&f.status===416){let u=f.headers.get("Content-Range");if(!u||!u.startsWith("bytes */"))throw new Error("Missing content-length on 416 response");let d=+u.substr(8);o.set("range",`bytes=0-${d-1}`),f=yield fetch(this.url,{signal:s,cache:"reload",headers:o,credentials:this.credentials})}let c=f.headers.get("Etag");if(c!=null&&c.startsWith("W/")&&(c=null),f.status===416||i&&c&&c!==i)throw this.mustReload=!0,new H(`Server returned non-matching ETag ${i} after one retry. Check browser extensions and servers for issues that may affect correct ETag headers.`);if(f.status>=300)throw new Error(`Bad response code: ${f.status}`);let l=f.headers.get("Content-Length");if(f.status===200&&(!l||+l>t))throw a&&a.abort(),new Error("Server returned no content-length header or content-length exceeding request. Check that your storage backend supports HTTP Byte Serving.");return{data:yield f.arrayBuffer(),etag:c||void 0,cacheControl:f.headers.get("Cache-Control")||void 0,expires:f.headers.get("Expires")||void 0}})}};g(Oe,"FetchSource");var $e=Oe;function x(r,e){let t=r.getUint32(e+4,!0),n=r.getUint32(e+0,!0);return t*wt(2,32)+n}g(x,"getUint64");function ae(r,e){let t=new DataView(r),n=t.getUint8(7);if(n>3)throw new Error(`Archive is spec version ${n} but this library supports up to spec version 3`);return{specVersion:n,rootDirectoryOffset:x(t,8),rootDirectoryLength:x(t,16),jsonMetadataOffset:x(t,24),jsonMetadataLength:x(t,32),leafDirectoryOffset:x(t,40),leafDirectoryLength:x(t,48),tileDataOffset:x(t,56),tileDataLength:x(t,64),numAddressedTiles:x(t,72),numTileEntries:x(t,80),numTileContents:x(t,88),clustered:t.getUint8(96)===1,internalCompression:t.getUint8(97),tileCompression:t.getUint8(98),tileType:t.getUint8(99),minZoom:t.getUint8(100),maxZoom:t.getUint8(101),minLon:t.getInt32(102,!0)/1e7,minLat:t.getInt32(106,!0)/1e7,maxLon:t.getInt32(110,!0)/1e7,maxLat:t.getInt32(114,!0)/1e7,centerZoom:t.getUint8(118),centerLon:t.getInt32(119,!0)/1e7,centerLat:t.getInt32(123,!0)/1e7,etag:e}}g(ae,"bytesToHeader");function se(r){let e={buf:new Uint8Array(r),pos:0},t=D(e),n=[],i=0;for(let a=0;a<t;a++){let s=D(e);n.push({tileId:i+s,offset:0,length:0,runLength:1}),i+=s}for(let a=0;a<t;a++)n[a].runLength=D(e);for(let a=0;a<t;a++)n[a].length=D(e);for(let a=0;a<t;a++){let s=D(e);s===0&&a>0?n[a].offset=n[a-1].offset+n[a-1].length:n[a].offset=s-1}return n}g(se,"deserializeIndex");var He=class extends Error{};g(He,"EtagMismatch");var H=He;function oe(r,e){return y(this,null,function*(){let t=yield r.getBytes(0,16384);if(new DataView(t.data).getUint16(0,!0)!==19792)throw new Error("Wrong magic number for PMTiles archive");let n=t.data.slice(0,At),i=ae(n,t.etag),a=t.data.slice(i.rootDirectoryOffset,i.rootDirectoryOffset+i.rootDirectoryLength),s=`${r.getKey()}|${i.etag||""}|${i.rootDirectoryOffset}|${i.rootDirectoryLength}`,o=se(yield e(a,i.internalCompression));return[i,[s,o.length,o]]})}g(oe,"getHeaderAndRoot");function le(r,e,t,n,i,a){return y(this,null,function*(){let s=yield r.getBytes(t,n,a,i.etag),o=yield e(s.data,i.internalCompression),h=se(o);if(h.length===0)throw new Error("Empty directory is invalid");return h})}g(le,"getDirectory");var Pe=class{constructor(e=100,t=!0,n=P){this.cache=new Map,this.maxCacheEntries=e,this.counter=1,this.decompress=n}getHeader(e){return y(this,null,function*(){let t=e.getKey(),n=this.cache.get(t);if(n)return n.lastUsed=this.counter++,n.data;let i=yield oe(e,this.decompress);return i[1]&&this.cache.set(i[1][0],{lastUsed:this.counter++,data:i[1][2]}),this.cache.set(t,{lastUsed:this.counter++,data:i[0]}),this.prune(),i[0]})}getDirectory(e,t,n,i,a){return y(this,null,function*(){let s=`${e.getKey()}|${i.etag||""}|${t}|${n}`,o=this.cache.get(s);if(o)return o.lastUsed=this.counter++,o.data;let h=yield le(e,this.decompress,t,n,i,a);return this.cache.set(s,{lastUsed:this.counter++,data:h}),this.prune(),h})}prune(){if(this.cache.size>this.maxCacheEntries){let e=1/0,t;this.cache.forEach((n,i)=>{n.lastUsed<e&&(e=n.lastUsed,t=i)}),t&&this.cache.delete(t)}}invalidate(e){return y(this,null,function*(){this.cache.delete(e.getKey())})}};g(Pe,"ResolvedValueCache");var Ut=Pe,Re=class{constructor(e=100,t=!0,n=P){this.cache=new Map,this.invalidations=new Map,this.pendingFetches=new Map,this.maxCacheEntries=e,this.counter=1,this.decompress=n}getHeader(e){return y(this,null,function*(){let t=e.getKey(),n=this.cache.get(t);if(n)return n.lastUsed=this.counter++,yield n.data;let i=new Promise((a,s)=>{oe(e,this.decompress).then(o=>{o[1]&&this.cache.set(o[1][0],{lastUsed:this.counter++,data:Promise.resolve(o[1][2])}),a(o[0]),this.prune()}).catch(o=>{s(o)})});return this.cache.set(t,{lastUsed:this.counter++,data:i}),i})}trackSignal(e,t,n){t.refs++,n.addEventListener("abort",()=>{--t.refs<=0&&this.pendingFetches.get(e)===t&&(t.controller.abort(),this.cache.delete(e),this.pendingFetches.delete(e))},{once:!0})}getDirectory(e,t,n,i,a){return y(this,null,function*(){let s=`${e.getKey()}|${i.etag||""}|${t}|${n}`,o=this.cache.get(s);if(o){o.lastUsed=this.counter++;let l=this.pendingFetches.get(s);return l&&this.trackSignal(s,l,a!=null?a:new AbortController().signal),yield o.data}let h=new AbortController,f={controller:h,refs:0};this.trackSignal(s,f,a!=null?a:new AbortController().signal),this.pendingFetches.set(s,f);let c=new Promise((l,u)=>{le(e,this.decompress,t,n,i,h.signal).then(d=>{this.pendingFetches.delete(s),l(d),this.prune()}).catch(d=>{u(d)})});return this.cache.set(s,{lastUsed:this.counter++,data:c}),c})}prune(){if(this.cache.size>=this.maxCacheEntries){let e=1/0,t;this.cache.forEach((n,i)=>{n.lastUsed<e&&(e=n.lastUsed,t=i)}),t&&this.cache.delete(t)}}invalidate(e){return y(this,null,function*(){let t=e.getKey();if(this.invalidations.get(t))return yield this.invalidations.get(t);this.cache.delete(e.getKey());let n=new Promise((i,a)=>{this.getHeader(e).then(s=>{i(),this.invalidations.delete(t)}).catch(s=>{a(s)})});this.invalidations.set(t,n)})}};g(Re,"SharedPromiseCache");var Ge=Re,je=class{constructor(e,t,n){typeof e=="string"?this.source=new $e(e):this.source=e,n?this.decompress=n:this.decompress=P,t?this.cache=t:this.cache=new Ge}getHeader(){return y(this,null,function*(){return yield this.cache.getHeader(this.source)})}getZxyAttempt(e,t,n,i){return y(this,null,function*(){let a=re(e,t,n),s=yield this.cache.getHeader(this.source);if(i==null||i.throwIfAborted(),e<s.minZoom||e>s.maxZoom)return;let o=s.rootDirectoryOffset,h=s.rootDirectoryLength;for(let f=0;f<=3;f++){let c=yield this.cache.getDirectory(this.source,o,h,s,i);i==null||i.throwIfAborted();let l=ie(c,a);if(l){if(l.runLength>0){let u=yield this.source.getBytes(s.tileDataOffset+l.offset,l.length,i,s.etag);return{data:yield this.decompress(u.data,s.tileCompression),cacheControl:u.cacheControl,expires:u.expires}}o=s.leafDirectoryOffset+l.offset,h=l.length}else return}throw new Error("Maximum directory depth exceeded")})}getZxy(e,t,n,i){return y(this,null,function*(){try{return yield this.getZxyAttempt(e,t,n,i)}catch(a){if(a instanceof H)return this.cache.invalidate(this.source),yield this.getZxyAttempt(e,t,n,i);throw a}})}getMetadataAttempt(){return y(this,null,function*(){let e=yield this.cache.getHeader(this.source),t=yield this.source.getBytes(e.jsonMetadataOffset,e.jsonMetadataLength,void 0,e.etag),n=yield this.decompress(t.data,e.internalCompression),i=new TextDecoder("utf-8");return JSON.parse(i.decode(n))})}getMetadata(){return y(this,null,function*(){try{return yield this.getMetadataAttempt()}catch(e){if(e instanceof H)return this.cache.invalidate(this.source),yield this.getMetadataAttempt();throw e}})}getTileJson(e){return y(this,null,function*(){let t=yield this.getHeader(),n=yield this.getMetadata(),i=ne(t.tileType);return{tilejson:"3.0.0",scheme:"xyz",tiles:[`${e}/{z}/{x}/{y}${i}`],vector_layers:n.vector_layers,attribution:n.attribution,description:n.description,name:n.name,version:n.version,bounds:[t.minLon,t.minLat,t.maxLon,t.maxLat],center:[t.centerLon,t.centerLat,t.centerZoom],minzoom:t.minZoom,maxzoom:t.maxZoom}})}};g(je,"PMTiles");var ee=je;return _e(Ct);})();

;
﻿!function (t) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else { var i; i = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, i.Pbf = t() } }(function () { return function t(i, e, r) { function s(o, h) { if (!e[o]) { if (!i[o]) { var a = "function" == typeof require && require; if (!h && a) return a(o, !0); if (n) return n(o, !0); var u = new Error("Cannot find module '" + o + "'"); throw u.code = "MODULE_NOT_FOUND", u } var f = e[o] = { exports: {} }; i[o][0].call(f.exports, function (t) { var e = i[o][1][t]; return s(e ? e : t) }, f, f.exports, t, i, e, r) } return e[o].exports } for (var n = "function" == typeof require && require, o = 0; o < r.length; o++)s(r[o]); return s }({ 1: [function (t, i, e) { "use strict"; function r(t) { this.buf = ArrayBuffer.isView && ArrayBuffer.isView(t) ? t : new Uint8Array(t || 0), this.pos = 0, this.type = 0, this.length = this.buf.length } function s(t, i, e) { var r, s, n = e.buf; if (s = n[e.pos++], r = (112 & s) >> 4, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 3, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 10, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 17, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 24, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (1 & s) << 31, s < 128) return o(t, r, i); throw new Error("Expected varint not more than 10 bytes") } function n(t) { return t.type === r.Bytes ? t.readVarint() + t.pos : t.pos + 1 } function o(t, i, e) { return e ? 4294967296 * i + (t >>> 0) : 4294967296 * (i >>> 0) + (t >>> 0) } function h(t, i) { var e, r; if (t >= 0 ? (e = t % 4294967296 | 0, r = t / 4294967296 | 0) : (e = ~(-t % 4294967296), r = ~(-t / 4294967296), 4294967295 ^ e ? e = e + 1 | 0 : (e = 0, r = r + 1 | 0)), t >= 0x10000000000000000 || t < -0x10000000000000000) throw new Error("Given varint doesn't fit into 10 bytes"); i.realloc(10), a(e, r, i), u(r, i) } function a(t, i, e) { e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos] = 127 & t } function u(t, i) { var e = (7 & t) << 4; i.buf[i.pos++] |= e | ((t >>>= 3) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t))))) } function f(t, i, e) { var r = i <= 16383 ? 1 : i <= 2097151 ? 2 : i <= 268435455 ? 3 : Math.ceil(Math.log(i) / (7 * Math.LN2)); e.realloc(r); for (var s = e.pos - 1; s >= t; s--)e.buf[s + r] = e.buf[s] } function d(t, i) { for (var e = 0; e < t.length; e++)i.writeVarint(t[e]) } function p(t, i) { for (var e = 0; e < t.length; e++)i.writeSVarint(t[e]) } function c(t, i) { for (var e = 0; e < t.length; e++)i.writeFloat(t[e]) } function l(t, i) { for (var e = 0; e < t.length; e++)i.writeDouble(t[e]) } function w(t, i) { for (var e = 0; e < t.length; e++)i.writeBoolean(t[e]) } function F(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed32(t[e]) } function b(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed32(t[e]) } function v(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed64(t[e]) } function g(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed64(t[e]) } function x(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + 16777216 * t[i + 3] } function V(t, i, e) { t[e] = i, t[e + 1] = i >>> 8, t[e + 2] = i >>> 16, t[e + 3] = i >>> 24 } function y(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + (t[i + 3] << 24) } function M(t, i, e) { for (var r = "", s = i; s < e;) { var n = t[s], o = null, h = n > 239 ? 4 : n > 223 ? 3 : n > 191 ? 2 : 1; if (s + h > e) break; var a, u, f; 1 === h ? n < 128 && (o = n) : 2 === h ? (a = t[s + 1], 128 === (192 & a) && (o = (31 & n) << 6 | 63 & a, o <= 127 && (o = null))) : 3 === h ? (a = t[s + 1], u = t[s + 2], 128 === (192 & a) && 128 === (192 & u) && (o = (15 & n) << 12 | (63 & a) << 6 | 63 & u, (o <= 2047 || o >= 55296 && o <= 57343) && (o = null))) : 4 === h && (a = t[s + 1], u = t[s + 2], f = t[s + 3], 128 === (192 & a) && 128 === (192 & u) && 128 === (192 & f) && (o = (15 & n) << 18 | (63 & a) << 12 | (63 & u) << 6 | 63 & f, (o <= 65535 || o >= 1114112) && (o = null))), null === o ? (o = 65533, h = 1) : o > 65535 && (o -= 65536, r += String.fromCharCode(o >>> 10 & 1023 | 55296), o = 56320 | 1023 & o), r += String.fromCharCode(o), s += h } return r } function S(t, i, e) { for (var r, s, n = 0; n < i.length; n++) { if (r = i.charCodeAt(n), r > 55295 && r < 57344) { if (!s) { r > 56319 || n + 1 === i.length ? (t[e++] = 239, t[e++] = 191, t[e++] = 189) : s = r; continue } if (r < 56320) { t[e++] = 239, t[e++] = 191, t[e++] = 189, s = r; continue } r = s - 55296 << 10 | r - 56320 | 65536, s = null } else s && (t[e++] = 239, t[e++] = 191, t[e++] = 189, s = null); r < 128 ? t[e++] = r : (r < 2048 ? t[e++] = r >> 6 | 192 : (r < 65536 ? t[e++] = r >> 12 | 224 : (t[e++] = r >> 18 | 240, t[e++] = r >> 12 & 63 | 128), t[e++] = r >> 6 & 63 | 128), t[e++] = 63 & r | 128) } return e } i.exports = r; var B = t("ieee754"); r.Varint = 0, r.Fixed64 = 1, r.Bytes = 2, r.Fixed32 = 5; var k = 4294967296, P = 1 / k; r.prototype = { destroy: function () { this.buf = null }, readFields: function (t, i, e) { for (e = e || this.length; this.pos < e;) { var r = this.readVarint(), s = r >> 3, n = this.pos; this.type = 7 & r, t(s, i, this), this.pos === n && this.skip(r) } return i }, readMessage: function (t, i) { return this.readFields(t, i, this.readVarint() + this.pos) }, readFixed32: function () { var t = x(this.buf, this.pos); return this.pos += 4, t }, readSFixed32: function () { var t = y(this.buf, this.pos); return this.pos += 4, t }, readFixed64: function () { var t = x(this.buf, this.pos) + x(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readSFixed64: function () { var t = x(this.buf, this.pos) + y(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readFloat: function () { var t = B.read(this.buf, this.pos, !0, 23, 4); return this.pos += 4, t }, readDouble: function () { var t = B.read(this.buf, this.pos, !0, 52, 8); return this.pos += 8, t }, readVarint: function (t) { var i, e, r = this.buf; return e = r[this.pos++], i = 127 & e, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 7, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 14, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 21, e < 128 ? i : (e = r[this.pos], i |= (15 & e) << 28, s(i, t, this))))) }, readVarint64: function () { return this.readVarint(!0) }, readSVarint: function () { var t = this.readVarint(); return t % 2 === 1 ? (t + 1) / -2 : t / 2 }, readBoolean: function () { return Boolean(this.readVarint()) }, readString: function () { var t = this.readVarint() + this.pos, i = M(this.buf, this.pos, t); return this.pos = t, i }, readBytes: function () { var t = this.readVarint() + this.pos, i = this.buf.subarray(this.pos, t); return this.pos = t, i }, readPackedVarint: function (t, i) { var e = n(this); for (t = t || []; this.pos < e;)t.push(this.readVarint(i)); return t }, readPackedSVarint: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSVarint()); return t }, readPackedBoolean: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readBoolean()); return t }, readPackedFloat: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFloat()); return t }, readPackedDouble: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readDouble()); return t }, readPackedFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed32()); return t }, readPackedSFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed32()); return t }, readPackedFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed64()); return t }, readPackedSFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed64()); return t }, skip: function (t) { var i = 7 & t; if (i === r.Varint) for (; this.buf[this.pos++] > 127;); else if (i === r.Bytes) this.pos = this.readVarint() + this.pos; else if (i === r.Fixed32) this.pos += 4; else { if (i !== r.Fixed64) throw new Error("Unimplemented type: " + i); this.pos += 8 } }, writeTag: function (t, i) { this.writeVarint(t << 3 | i) }, realloc: function (t) { for (var i = this.length || 16; i < this.pos + t;)i *= 2; if (i !== this.length) { var e = new Uint8Array(i); e.set(this.buf), this.buf = e, this.length = i } }, finish: function () { return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length) }, writeFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeSFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeSFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeVarint: function (t) { return t = +t || 0, t > 268435455 || t < 0 ? void h(t, this) : (this.realloc(4), this.buf[this.pos++] = 127 & t | (t > 127 ? 128 : 0), void (t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = t >>> 7 & 127))))) }, writeSVarint: function (t) { this.writeVarint(t < 0 ? 2 * -t - 1 : 2 * t) }, writeBoolean: function (t) { this.writeVarint(Boolean(t)) }, writeString: function (t) { t = String(t), this.realloc(4 * t.length), this.pos++; var i = this.pos; this.pos = S(this.buf, t, this.pos); var e = this.pos - i; e >= 128 && f(i, e, this), this.pos = i - 1, this.writeVarint(e), this.pos += e }, writeFloat: function (t) { this.realloc(4), B.write(this.buf, t, this.pos, !0, 23, 4), this.pos += 4 }, writeDouble: function (t) { this.realloc(8), B.write(this.buf, t, this.pos, !0, 52, 8), this.pos += 8 }, writeBytes: function (t) { var i = t.length; this.writeVarint(i), this.realloc(i); for (var e = 0; e < i; e++)this.buf[this.pos++] = t[e] }, writeRawMessage: function (t, i) { this.pos++; var e = this.pos; t(i, this); var r = this.pos - e; r >= 128 && f(e, r, this), this.pos = e - 1, this.writeVarint(r), this.pos += r }, writeMessage: function (t, i, e) { this.writeTag(t, r.Bytes), this.writeRawMessage(i, e) }, writePackedVarint: function (t, i) { this.writeMessage(t, d, i) }, writePackedSVarint: function (t, i) { this.writeMessage(t, p, i) }, writePackedBoolean: function (t, i) { this.writeMessage(t, w, i) }, writePackedFloat: function (t, i) { this.writeMessage(t, c, i) }, writePackedDouble: function (t, i) { this.writeMessage(t, l, i) }, writePackedFixed32: function (t, i) { this.writeMessage(t, F, i) }, writePackedSFixed32: function (t, i) { this.writeMessage(t, b, i) }, writePackedFixed64: function (t, i) { this.writeMessage(t, v, i) }, writePackedSFixed64: function (t, i) { this.writeMessage(t, g, i) }, writeBytesField: function (t, i) { this.writeTag(t, r.Bytes), this.writeBytes(i) }, writeFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFixed32(i) }, writeSFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeSFixed32(i) }, writeFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeFixed64(i) }, writeSFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeSFixed64(i) }, writeVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeVarint(i) }, writeSVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeSVarint(i) }, writeStringField: function (t, i) { this.writeTag(t, r.Bytes), this.writeString(i) }, writeFloatField: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFloat(i) }, writeDoubleField: function (t, i) { this.writeTag(t, r.Fixed64), this.writeDouble(i) }, writeBooleanField: function (t, i) { this.writeVarintField(t, Boolean(i)) } } }, { ieee754: 2 }], 2: [function (t, i, e) { e.read = function (t, i, e, r, s) { var n, o, h = 8 * s - r - 1, a = (1 << h) - 1, u = a >> 1, f = -7, d = e ? s - 1 : 0, p = e ? -1 : 1, c = t[i + d]; for (d += p, n = c & (1 << -f) - 1, c >>= -f, f += h; f > 0; n = 256 * n + t[i + d], d += p, f -= 8); for (o = n & (1 << -f) - 1, n >>= -f, f += r; f > 0; o = 256 * o + t[i + d], d += p, f -= 8); if (0 === n) n = 1 - u; else { if (n === a) return o ? NaN : (c ? -1 : 1) * (1 / 0); o += Math.pow(2, r), n -= u } return (c ? -1 : 1) * o * Math.pow(2, n - r) }, e.write = function (t, i, e, r, s, n) { var o, h, a, u = 8 * n - s - 1, f = (1 << u) - 1, d = f >> 1, p = 23 === s ? Math.pow(2, -24) - Math.pow(2, -77) : 0, c = r ? 0 : n - 1, l = r ? 1 : -1, w = i < 0 || 0 === i && 1 / i < 0 ? 1 : 0; for (i = Math.abs(i), isNaN(i) || i === 1 / 0 ? (h = isNaN(i) ? 1 : 0, o = f) : (o = Math.floor(Math.log(i) / Math.LN2), i * (a = Math.pow(2, -o)) < 1 && (o--, a *= 2), i += o + d >= 1 ? p / a : p * Math.pow(2, 1 - d), i * a >= 2 && (o++, a /= 2), o + d >= f ? (h = 0, o = f) : o + d >= 1 ? (h = (i * a - 1) * Math.pow(2, s), o += d) : (h = i * Math.pow(2, d - 1) * Math.pow(2, s), o = 0)); s >= 8; t[e + c] = 255 & h, c += l, h /= 256, s -= 8); for (o = o << s | h, u += s; u > 0; t[e + c] = 255 & o, c += l, o /= 256, u -= 8); t[e + c - l] |= 128 * w } }, {}] }, {}, [1])(1) });
;
﻿function VectorTile(buffer, end) {
    this.layers = {};
    this._buffer = buffer;
    end = end || buffer.length;

    var pos = buffer.pos;
    while (pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag === 3) {
            var layer = this._readLayer();
            if (layer.length) {
                this.layers[layer.name] = layer;
            }
        } else {
            buffer.skip(val);
        }
        pos = buffer.pos;
    }
    this.parseGeometries();
}

VectorTile.prototype._readLayer = function () {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;
    return layer;
};

VectorTile.prototype.parseGeometries = function () {
    var layers = this.layers;
    for (var key in layers) {
        if (!layers.hasOwnProperty(key)) continue;

        var layer = layers[key];
        var features = layer._features;
        var len = features.length;
        var parsedFeatures = new Array(len);

        for (var i = 0; i < len; i++) {
            var feature = layer.feature(i);
            feature.coordinates = feature.loadGeometry();
            parsedFeatures[i] = feature;
        }
        layer.parsedFeatures = parsedFeatures;
    }
};
;
﻿function VectorTileFeature(buffer, end, extent, keys, values) {
    this.properties = {};
    this.extent = extent;
    this.type = 0;
    this._buffer = buffer;
    this._geometry = -1;

    end = end || buffer.length;
    var pos = buffer.pos;

    while (pos < end) {
        buffer.pos = pos;
        var val = buffer.readVarint(),
            tag = val >> 3;
        pos = buffer.pos;

        switch (tag) {
            case 1:
                this._id = buffer.readVarint();
                pos = buffer.pos;
                break;
            case 2:
                var tagEnd = pos + buffer.readVarint();
                pos = buffer.pos;
                while (pos < tagEnd) {
                    buffer.pos = pos;
                    var keyIdx = buffer.readVarint();
                    var valueIdx = buffer.readVarint();
                    this.properties[keys[keyIdx]] = values[valueIdx];
                    pos = buffer.pos;
                }
                break;
            case 3:
                this.type = buffer.readVarint();
                pos = buffer.pos;
                break;
            case 4:
                this._geometry = pos;
                buffer.skip(val);
                pos = buffer.pos;
                break;
            default:
                buffer.skip(val);
                pos = buffer.pos;
                break;
        }
    }
    buffer.pos = pos;
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var end = buffer.pos + buffer.readVarint(),
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line = null,
        pos = buffer.pos;

    while (pos < end) {
        if (length === 0) {
            buffer.pos = pos;
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
            pos = buffer.pos;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            buffer.pos = pos;
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            pos = buffer.pos;

            if (cmd === 1) {
                // moveTo
                if (line !== null) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            if (line !== null && line.length > 0) {
                line.push(line[0].clone());
            }
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line !== null) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var end = buffer.pos + buffer.readVarint(),
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity,
        pos = buffer.pos;

    while (pos < end) {
        if (length === 0) {
            buffer.pos = pos;
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
            pos = buffer.pos;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            buffer.pos = pos;
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            pos = buffer.pos;

            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;
        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};
;
﻿function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    end = end || buffer.length;

    // Cache buffer.pos to avoid repeated property lookups
    var pos, val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 15:
                this.version = buffer.readVarint();
                break;
            case 1:
                this.name = buffer.readString();
                break;
            case 5:
                this.extent = buffer.readVarint();
                break;
            case 2:
                this.length++;
                this._features.push(buffer.pos);
                buffer.skip(val);
                break;
            case 3:
                this._keys.push(buffer.readString());
                break;
            case 4:
                this._values.push(this.readFeatureValue());
                break;
            default:
                buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function () {
    var buffer = this._buffer,
        value = null,
        end = buffer.pos + buffer.readVarint(),
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 1:
                value = buffer.readString();
                break;
            case 2:
                value = buffer.readFloat();
                break;
            case 3:
                value = buffer.readDouble();
                break;
            case 4:
            case 5:
                value = buffer.readVarint();
                break;
            case 6:
                value = buffer.readSVarint();
                break;
            case 7:
                value = Boolean(buffer.readVarint());
                break;
            default:
                buffer.skip(val);
        }
    }

    return value;
};

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function (i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;

    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};
;
﻿function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
};

Point.prototype.add = function (p) {
    return new Point(this.x + p.x, this.y + p.y);
};

Point.prototype.sub = function (p) {
    return new Point(this.x - p.x, this.y - p.y);
};

Point.prototype.mult = function (k) {
    return new Point(this.x * k, this.y * k);
};

Point.prototype.div = function (k) {
    return new Point(this.x / k, this.y / k);
};

Point.prototype.rotate = function (a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Point(cos * this.x - sin * this.y, sin * this.x + cos * this.y);
};

Point.prototype.matMult = function (m) {
    return new Point(m[0] * this.x + m[1] * this.y, m[2] * this.x + m[3] * this.y);
};

Point.prototype.unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Point(this.x / mag, this.y / mag);
};

Point.prototype.perp = function () {
    return new Point(-this.y, this.x);
};

Point.prototype.round = function () {
    return new Point(Math.round(this.x), Math.round(this.y));
};

Point.prototype.mag = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.equals = function (p) {
    return this.x === p.x && this.y === p.y;
};

Point.prototype.dist = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Point.prototype.distSqr = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return dx * dx + dy * dy;
};

Point.prototype.angle = function () {
    return Math.atan2(this.y, this.x);
};

Point.prototype.angleTo = function (b) {
    return Math.atan2(this.y - b.y, this.x - b.x);
};

Point.prototype.angleWith = function (b) {
    return Math.atan2(this.x * b.y - this.y * b.x, this.x * b.x + this.y * b.y);
};

Point.prototype.angleWithSep = function (x, y) {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
};

Point.prototype._matMult = function (m) {
    const x = m[0] * this.x + m[1] * this.y;
    this.y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    return this;
};

Point.prototype._add = function (p) {
    this.x += p.x;
    this.y += p.y;
    return this;
};

Point.prototype._sub = function (p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
};

Point.prototype._mult = function (k) {
    this.x *= k;
    this.y *= k;
    return this;
};

Point.prototype._div = function (k) {
    this.x /= k;
    this.y /= k;
    return this;
};

Point.prototype._unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= mag;
    this.y /= mag;
    return this;
};

Point.prototype._perp = function () {
    const y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
};

Point.prototype._rotate = function (angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cos * this.x - sin * this.y;
    this.y = sin * this.x + cos * this.y;
    this.x = x;
    return this;
};

Point.prototype._round = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};
;
﻿MERCATOR = (function () {
    // Pre-calculate constants
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    const LNG_SCALE = 256 / 360;
    const LAT_SCALE = 256 / (2 * Math.PI);
    const WORLD_SIZE = 256;
    const HALF_WORLD = 128;
    const SINY_CLAMP = 0.9999;

    return {
        fromLatLngToPoint: function (latLng) {
            const lat = latLng.lat() * DEG_TO_RAD;
            const siny = Math.min(Math.max(Math.sin(lat), -SINY_CLAMP), SINY_CLAMP);
            return {
                x: HALF_WORLD + latLng.lng() * LNG_SCALE,
                y: HALF_WORLD + 0.5 * Math.log((1 + siny) / (1 - siny)) * -LAT_SCALE
            };
        },

        fromPointToLatLng: function (point) {
            return {
                lat: (2 * Math.atan(Math.exp((point.y - HALF_WORLD) / -LAT_SCALE)) - Math.PI / 2) * RAD_TO_DEG,
                lng: (point.x - HALF_WORLD) / LNG_SCALE
            };
        },

        getTileAtLatLng: function (latLng, zoom) {
            const t = 1 << zoom; // Bit shift instead of Math.pow(2, zoom)
            const s = WORLD_SIZE / t;
            const p = this.fromLatLngToPoint(latLng);
            return {
                x: Math.floor(p.x / s),
                y: Math.floor(p.y / s),
                z: zoom
            };
        },

        getTileBounds: function (tile) {
            tile = this.normalizeTile(tile);
            const t = 1 << tile.z;
            const s = WORLD_SIZE / t;
            const x1 = tile.x * s;
            const y1 = tile.y * s;

            return {
                sw: this.fromPointToLatLng({ x: x1, y: y1 + s }),
                ne: this.fromPointToLatLng({ x: x1 + s, y: y1 })
            };
        },

        normalizeTile: function (tile) {
            const t = 1 << tile.z;
            tile.x = ((tile.x % t) + t) % t;
            tile.y = ((tile.y % t) + t) % t;
            return tile;
        },

        fromLatLngToPixels: function (map, latLng) {
            const bounds = map.getBounds();
            const projection = map.getProjection();
            const scale = 1 << map.getZoom(); // Bit shift for power of 2

            const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
            const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
            const worldPoint = projection.fromLatLngToPoint(latLng);

            return {
                x: (worldPoint.x - bottomLeft.x) * scale,
                y: (worldPoint.y - topRight.y) * scale
            };
        },

        fromLatLngToTilePoint: function (map, evt) {
            const zoom = map.getZoom();
            const tile = this.getTileAtLatLng(evt.latLng, zoom);
            const tileBounds = this.getTileBounds(tile);
            const tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
            const tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
            const tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);
            const tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);

            return {
                x: evt.pixel.x - tileSwPixels.x,
                y: evt.pixel.y - tileNePixels.y
            };
        },

        isPointInPolygon: function (point, polygon) {
            if (!polygon || !polygon.length) return false;

            let inside = false;
            const px = point.x;
            const py = point.y;

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;

                const intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        },

        in_circle: function (center_x, center_y, radius, x, y) {
            const dx = center_x - x;
            const dy = center_y - y;
            return (dx * dx + dy * dy) <= radius * radius;
        },

        getDistanceFromLine: function (point, line) {
            if (!line || line.length < 2) return Number.POSITIVE_INFINITY;

            let minDistance = Number.POSITIVE_INFINITY;
            const px = point.x;
            const py = point.y;

            for (let i = 0, l = line.length - 1; i < l; i++) {
                const distance = this.projectPointOnLineSegment(px, py, line[i], line[i + 1]);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
            return minDistance;
        },

        projectPointOnLineSegment: function (px, py, r0, r1) {
            const x1 = r0.x;
            const y1 = r0.y;
            const x2 = r1.x;
            const y2 = r1.y;

            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const len_sq = C * C + D * D;

            let xx, yy;

            if (len_sq === 0) { // Zero length line
                xx = x1;
                yy = y1;
            } else {
                const param = dot / len_sq;

                if (param < 0) {
                    xx = x1;
                    yy = y1;
                } else if (param > 1) {
                    xx = x2;
                    yy = y2;
                } else {
                    xx = x1 + param * C;
                    yy = y1 + param * D;
                }
            }

            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
    };
})();
;
/*
 *  Created by Jesús Barrio on 04/2021
 */

const TWO_PI = Math.PI * 2;

class MVTFeature {
    constructor(options) {
        this.mVTSource = options.mVTSource;
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = Object.create(null); // Use object without prototype overhead
        this.style = options.style;
        this.type = options.vectorTileFeature.type;
        this.properties = options.vectorTileFeature.properties;
        this.addTileFeature(options.vectorTileFeature, options.tileContext);
        this._draw = options.customDraw || this.defaultDraw;
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tiles[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            divisor: vectorTileFeature.extent / tileContext.tileSize,
            context2d: null,
            paths2d: null,
            paths: null
        };
    }

    getTiles() {
        return this.tiles;
    }

    getTile(tileContext) {
        return this.tiles[tileContext.id];
    }

    setStyle(style) {
        this.style = style;
    }

    redrawTiles() {
        const zoom = this.mVTSource.map.getZoom();
        const mVTSource = this.mVTSource;
        const tiles = this.tiles;
        const tileKeys = Object.keys(tiles);

        for (let i = 0, len = tileKeys.length; i < len; i++) {
            const id = tileKeys[i];
            mVTSource.deleteTileDrawn(id);
            const idObject = mVTSource.getTileObject(id);
            if (idObject.zoom === zoom) { // Removed parseInt, assume zoom is already a number
                mVTSource.redrawTile(id);
            }
        }
    }

    toggle() {
        if (this.selected) {
            this.deselect();
        } else {
            this.select();
        }
    }

    select() {
        this.selected = true;
        this.mVTSource.featureSelected(this);
        this.redrawTiles();
    }

    deselect() {
        this.selected = false;
        this.mVTSource.featureDeselected(this);
        this.redrawTiles();
    }

    setSelected(selected) {
        this.selected = selected;
    }

    draw(tileContext) {
        const tile = this.tiles[tileContext.id];
        const style = (this.selected && this.style.selected) ? this.style.selected : this.style;
        this._draw(tileContext, tile, style, this);
    }

    defaultDraw(tileContext, tile, style) {
        const type = this.type;

        if (type === 1) { // Point
            this.drawPoint(tileContext, tile, style);
        } else if (type === 2) { // LineString
            this.drawLineString(tileContext, tile, style);
        } else if (type === 3) { // Polygon
            this.drawPolygon(tileContext, tile, style);
        }
    }

    drawPoint(tileContext, tile, style) {
        const coordinates = tile.vectorTileFeature.coordinates[0][0];
        const point = this.getPoint(coordinates, tileContext, tile.divisor);
        const radius = style.radius || 3;
        const context2d = this.getContext2d(tileContext.canvas, style);
        context2d.beginPath();
        context2d.arc(point.x, point.y, radius, 0, TWO_PI);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
    }

    drawLineString(tileContext, tile, style) {
        tile.context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, tile);
        tile.context2d.stroke(tile.paths2d);
    }

    drawPolygon(tileContext, tile, style) {
        const context2d = this.getContext2d(tileContext.canvas, style);
        tile.context2d = context2d;
        this.drawCoordinates(tileContext, tile);

        const paths2d = tile.paths2d;
        paths2d.closePath();

        const hasFill = style.fillStyle;
        const hasStroke = style.strokeStyle;

        // Fixed logic bug: was checking hasStroke three times
        if (hasFill && hasStroke) {
            context2d.fill(paths2d);
            context2d.stroke(paths2d);
        } else if (hasFill) {
            context2d.fill(paths2d);
        } else if (hasStroke) {
            context2d.stroke(paths2d);
        }
    }

    drawCoordinates(tileContext, tile) {
        if (tile.paths2d) {
            return;
        }
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const paths2d = new Path2D();
        const coordsLength = coordinates.length;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;

            if (coordLength > 0) {
                const path2 = new Path2D();
                const firstPoint = this.getPoint(coordinate[0], tileContext, divisor);
                path2.moveTo(firstPoint.x, firstPoint.y);

                for (let j = 1; j < coordLength; j++) {
                    const point = this.getPoint(coordinate[j], tileContext, divisor);
                    path2.lineTo(point.x, point.y);
                }
                paths2d.addPath(path2);
            }
        }

        tile.paths2d = paths2d;
    }

    getPaths(tileContext) {
        const tile = this.tiles[tileContext.id];
        if (tile.paths) {
            return tile.paths;
        }
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const coordsLength = coordinates.length;
        const paths = new Array(coordsLength);
        let pathCount = 0;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;
            const path = new Array(coordLength);

            for (let j = 0; j < coordLength; j++) {
                path[j] = this.getPoint(coordinate[j], tileContext, divisor);
            }

            if (coordLength > 0) {
                paths[pathCount++] = path;
            }
        }

        paths.length = pathCount; // Trim array to actual size
        tile.paths = paths;
        return tile.paths;
    }

    getContext2d(canvas, style) {
        const context2d = canvas.getContext('2d');
        const keys = Object.keys(style);

        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            if (key !== 'selected') {
                context2d[key] = style[key];
            }
        }
        return context2d;
    }

    getPoint(coords, tileContext, divisor) {
        let x = coords.x / divisor;
        let y = coords.y / divisor;

        const parentId = tileContext.parentId;
        if (parentId) {
            const mVTSource = this.mVTSource;
            const parentTile = mVTSource.getTileObject(parentId);
            const currentTile = mVTSource.getTileObject(tileContext.id);
            const zoomDistance = currentTile.zoom - parentTile.zoom;
            const scale = Math.pow(2, zoomDistance);
            const tileSize = tileContext.tileSize;

            x = x * scale - ((((currentTile.x % scale) + scale) % scale) * tileSize);
            y = y * scale - ((currentTile.y % scale) * tileSize);
        }

        return { x, y };
    }

    _getOverzoomedPoint(point, tileContext) {
        const mVTSource = this.mVTSource;
        const parentTile = mVTSource.getTileObject(tileContext.parentId);
        const currentTile = mVTSource.getTileObject(tileContext.id);
        const zoomDistance = currentTile.zoom - parentTile.zoom;
        const scale = Math.pow(2, zoomDistance);
        const tileSize = tileContext.tileSize;

        point.x = point.x * scale - ((((currentTile.x % scale) + scale) % scale) * tileSize);
        point.y = point.y * scale - ((currentTile.y % scale) * tileSize);

        return point;
    }

    isPointInPath(point, tileContext) {
        const tile = this.getTile(tileContext);
        const context2d = tile.context2d;
        const paths2d = tile.paths2d;

        if (!context2d || !paths2d) {
            return false;
        }
        return context2d.isPointInPath(paths2d, point.x, point.y);
    }

    getBounds() {
        const bounds = new google.maps.LatLngBounds();
        const tileKeys = Object.keys(this.tiles);
        const worldSize = 256;
        const tileSize = this.mVTSource._tileSize;

        for (let i = 0, tilesLength = tileKeys.length; i < tilesLength; i++) {
            const tileId = tileKeys[i];
            const tileObject = this.mVTSource.getTileObject(tileId);
            const tile = this.tiles[tileId];
            const coordinates = tile.vectorTileFeature.coordinates;
            const divisor = tile.divisor;
            const scale = Math.pow(2, tileObject.zoom);
            const tileContext = {
                id: tileId,
                tileSize,
                parentId: this.mVTSource._getParentId(tileId)
            };

            for (let j = 0, coordinatesLength = coordinates.length; j < coordinatesLength; j++) {
                const geometry = coordinates[j];

                for (let k = 0, geometryLength = geometry.length; k < geometryLength; k++) {
                    const point = this.getPoint(geometry[k], tileContext, divisor);
                    const globalPixelX = tileObject.x * tileSize + point.x;
                    const globalPixelY = tileObject.y * tileSize + point.y;
                    const worldPoint = {
                        x: globalPixelX * (worldSize / (tileSize * scale)),
                        y: globalPixelY * (worldSize / (tileSize * scale))
                    };
                    const latLng = MERCATOR.fromPointToLatLng(worldPoint);
                    bounds.extend(latLng);
                }
            }
        }

        return bounds;
    }

}

;
/*
 *  Created by Jes�s Barrio on 04/2021
 */

class MVTLayer {
    constructor(options) {
        this._lineClickTolerance = 2;
        this._getIDForLayerFeature = options.getIDForLayerFeature;
        this.style = options.style;
        this.name = options.name;
        this._filter = options.filter || false;
        this._customDraw = options.customDraw || false;
        this._canvasAndMVTFeatures = Object.create(null);
        this._mVTFeatures = Object.create(null);
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        const tileId = tileContext.id;
        const features = [];
        this._canvasAndMVTFeatures[tileId] = {
            canvas: tileContext.canvas,
            features: features
        };

        for (let i = 0, length = vectorTileFeatures.length; i < length; i++) {
            const feature = this._parseVectorTileFeature(mVTSource, vectorTileFeatures[i], tileContext, i);
            if (feature) features.push(feature);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i) {
        if (this._filter && this._filter(vectorTileFeature, tileContext) === false) {
            return null;
        }

        const style = this.getStyle(vectorTileFeature);
        const featureId = this._getIDForLayerFeature(vectorTileFeature) || i;
        let mVTFeature = this._mVTFeatures[featureId];

        if (!mVTFeature) {
            mVTFeature = new MVTFeature({
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: mVTSource.isFeatureSelected(featureId),
                featureId: featureId,
                customDraw: this._customDraw
            });
            this._mVTFeatures[featureId] = mVTFeature;
            if (mVTFeature.selected) {
                mVTSource._restoreSelectedFeature(mVTFeature);
            }
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }

        return mVTFeature;
    }

    drawTile(tileContext) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[tileContext.id];
        if (!canvasAndFeatures) return;

        const mVTFeatures = canvasAndFeatures.features;
        const selectedFeatures = [];

        for (let i = 0, length = mVTFeatures.length; i < length; i++) {
            const mVTFeature = mVTFeatures[i];
            if (mVTFeature.selected) {
                selectedFeatures.push(mVTFeature);
            } else {
                mVTFeature.draw(tileContext);
            }
        }

        for (let i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[id];
        return canvasAndFeatures ? canvasAndFeatures.canvas : null;
    }

    getStyle(feature) {
        return typeof this.style === 'function' ? this.style(feature) : this.style;
    }

    setStyle(style) {
        this.style = style;
        const features = this._mVTFeatures;
        for (const featureId in features) {
            features[featureId].setStyle(style);
        }
    }

    setSelected(featureId) {
        const feature = this._mVTFeatures[featureId];
        if (feature !== undefined) {
            feature.select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event, mVTSource) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;

        const mVTFeatures = canvasAndFeatures.features;
        if (!mVTFeatures) return event;

        event.feature = this._handleClickEvent(event, mVTFeatures, mVTSource);
        return event;
    }

    _handleClickEvent(event, mVTFeatures, mVTSource) {
        const tileContextId = event.tileContext.id;
        const currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(tileContextId);

        // Check selected features first
        let result = this._handleClickFeatures(event, currentSelectedFeaturesInTile);
        if (result) return result;

        // Check all features
        return this._handleClickFeatures(event, mVTFeatures);
    }

    _handleClickFeatures(event, mVTFeatures) {
        let selectedFeature = null;
        let minDistance = Number.POSITIVE_INFINITY;

        for (let i = mVTFeatures.length - 1; i >= 0; i--) {
            const result = this._handleClickFeature(event, mVTFeatures[i], minDistance);
            if (result && result.distance < minDistance) {
                selectedFeature = result.feature;
                minDistance = result.distance;
                if (minDistance === 0) return selectedFeature;
            }
        }

        return selectedFeature;
    }

    _handleClickFeature(event, mVTFeature, currentMinDistance) {
        // Polygon type
        if (mVTFeature.type === 3) {
            if (mVTFeature.isPointInPath(event.tilePoint, event.tileContext)) {
                return { feature: mVTFeature, distance: 0 };
            }
            return null;
        }

        // Point and LineString types
        const paths = mVTFeature.getPaths(event.tileContext);
        const tilePoint = event.tilePoint;
        const featureType = mVTFeature.type;
        let minDistance = currentMinDistance;
        let found = false;

        for (let j = paths.length - 1; j >= 0; j--) {
            const path = paths[j];

            if (featureType === 1) { // Point
                if (MERCATOR.in_circle(path[0].x, path[0].y, mVTFeature.style.radius, tilePoint.x, tilePoint.y)) {
                    return { feature: mVTFeature, distance: 0 };
                }
            } else if (featureType === 2) { // LineString
                const distance = MERCATOR.getDistanceFromLine(tilePoint, path);
                const style = mVTFeature.style;
                const thickness = (mVTFeature.selected && style.selected) ? style.selected.lineWidth : style.lineWidth;

                if (distance < thickness / 2 + this._lineClickTolerance && distance < minDistance) {
                    minDistance = distance;
                    found = true;
                }
            }
        }

        return found ? { feature: mVTFeature, distance: minDistance } : null;
    }
}
;
/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this._url = options.url || ""; //Url TO Vector Tile Source,
        this._configuredMaxZoom = options.sourceMaxZoom === undefined ? false : options.sourceMaxZoom;
        this._sourceMaxZoom = this._configuredMaxZoom; // Source maxzoom to enable overzoom
        this._configuredSourceType = options.sourceType || 'auto';
        this._onTileError = options.onTileError || function (error) { console.error(error); };
        this._debug = options.debug || false; // Draw tiles lines and ids
        this.getIDForLayerFeature = options.getIDForLayerFeature || function (feature) {
            return feature.properties.id || feature.properties.Id || feature.properties.ID;
        };
        this._visibleLayers = options.visibleLayers || false;  // List of visible layers
        this._xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
        this._clickableLayers = options.clickableLayers || false;   // List of layers that are clickable
        this._filter = options.filter || false; // Filter features
        this._cache = options.cache || false; // Load tiles in cache to avoid duplicated requests
        this._tileSize = options.tileSize || 256; // Default tile size
        this.tileSize = new google.maps.Size(this._tileSize, this._tileSize);
        this.style = options.style || function (feature) {
            var style = {};
            switch (feature.type) {
                case 1: //'Point'
                    style.fillStyle = 'rgba(49,79,79,1)';
                    style.radius = 5;
                    style.selected = {
                        fillStyle: 'rgba(255,255,0,0.5)',
                        radius: 6
                    }
                    break;
                case 2: //'LineString'
                    style.strokeStyle = 'rgba(136, 86, 167, 1)';
                    style.lineWidth = 3;
                    style.selected = {
                        strokeStyle: 'rgba(255,25,0,0.5)',
                        lineWidth: 4
                    }
                    break;
                case 3: //'Polygon'
                    style.fillStyle = 'rgba(188, 189, 220, 0.5)';
                    style.strokeStyle = 'rgba(136, 86, 167, 1)';
                    style.lineWidth = 1;
                    style.selected = {
                        fillStyle: 'rgba(255,140,0,0.3)',
                        strokeStyle: 'rgba(255,140,0,1)',
                        lineWidth: 2
                    }
                    break;
            }
            return style;
        };
        this._customDraw = options.customDraw || false;

        this.mVTLayers = [];  //Keep a list of the layers contained in the PBFs        
        this._tilesDrawn = Object.create(null); //  List of tiles drawn  (when cache enabled)
        this._visibleTiles = Object.create(null); // tiles currently in the viewport        
        this._selectedFeatures = Object.create(null); // list of selected features
        this.loadedTilesLen = 0; // total number of loaded tiles
        this._sourceGeneration = 0;
        this._initializeSource();

        if (options.selectedFeatures) {
            this.setSelectedFeatures(options.selectedFeatures);
        }

        this.map.addListener("zoom_changed", () => {
            self._zoomChanged();
        });
    }

    getTile(coord, zoom, ownerDocument) {
        var tileContext = this.drawTile(coord, zoom, ownerDocument);
        this._setVisibleTile(tileContext);
        return tileContext.canvas;
    }

    releaseTile(canvas) {
        var tileContext = this._visibleTiles[canvas.id];
        if (tileContext && tileContext.canvas === canvas) {
            tileContext.released = true;
            this._deleteVisibleTile(canvas.id);
            this._updateLoadedTiles();
        }
    }

    _zoomChanged() {
        this._resetVisibleTiles();
        if (!this._cache) {
            this._resetMVTLayers();
        }
    }

    _resetMVTLayers() {
        this.mVTLayers = [];
    }

    _deleteVisibleTile(id) {
        delete this._visibleTiles[id];
    }

    _resetVisibleTiles() {
        this._visibleTiles = Object.create(null);
        this.loadedTilesLen = 0;
    }

    _setVisibleTile(tileContext) {
        tileContext.released = false;
        this._visibleTiles[tileContext.id] = tileContext;
        this._updateLoadedTiles();
    }

    drawTile(coord, zoom, ownerDocument) {
        var id = this.getTileId(zoom, coord.x, coord.y);
        var tileContext = this._tilesDrawn[id];
        if (tileContext) {
            return tileContext;
        }

        tileContext = this._createTileContext(coord, zoom, ownerDocument);
        this._loadTile(tileContext);
        return tileContext;
    }

    _createTileContext(coord, zoom, ownerDocument) {
        var id = this.getTileId(zoom, coord.x, coord.y);
        var canvas = this._createCanvas(ownerDocument, id);
        var parentId = this._getParentId(id);

        return {
            id: id,
            canvas: canvas,
            zoom: zoom,
            tileSize: this._tileSize,
            parentId: parentId
        };
    }

    _getParentId(id) {
        var parentId = false;
        if (this._sourceMaxZoom !== false) {
            var tile = this.getTileObject(id);
            if (tile.zoom > this._sourceMaxZoom) {
                var zoomDistance = tile.zoom - this._sourceMaxZoom;
                var zoom = tile.zoom - zoomDistance;
                var x = Math.floor(tile.x / Math.pow(2, zoomDistance));
                var y = Math.floor(tile.y / Math.pow(2, zoomDistance));
                parentId = this.getTileId(zoom, x, y);
            }
        }
        return parentId;
    }

    _createCanvas(ownerDocument, id) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this._tileSize;
        canvas.height = this._tileSize;
        canvas.id = id;
        return canvas;
    }

    getTileId(zoom, x, y) {
        return [zoom, x, y].join(":");
    }

    getTileObject(id) {
        var values = id.split(":");
        return {
            zoom: parseInt(values[0], 10),
            x: parseInt(values[1], 10),
            y: parseInt(values[2], 10)
        }
    }

    _initializeSource() {
        var generation = ++this._sourceGeneration;
        this._sourceType = this._configuredSourceType === 'auto'
            ? (/\.pmtiles(?:[?#]|$)/i.test(this._url) ? 'pmtiles' : 'pbf')
            : this._configuredSourceType;
        if (this._sourceType !== 'pbf' && this._sourceType !== 'pmtiles') {
            throw new Error('sourceType must be "auto", "pbf" or "pmtiles".');
        }
        this._sourceMaxZoom = this._configuredMaxZoom;
        this._pendingTiles = new Map();
        this._pmtiles = null;
        this._sourceReady = Promise.resolve();
        if (this._sourceType === 'pmtiles') {
            if (typeof pmtiles === 'undefined') {
                throw new Error('PMTiles reader is missing. Use the bundled distribution or load lib/pmtiles/pmtiles.js first.');
            }
            this._pmtiles = new pmtiles.PMTiles(new pmtiles.FetchSource(this._url, new Headers(this._xhrHeaders)));
            this._sourceReady = this._pmtiles.getHeader().then(header => {
                if (header.tileType !== pmtiles.TileType.Mvt) {
                    throw new Error('The PMTiles archive must contain MVT vector tiles.');
                }
                if (generation === this._sourceGeneration) {
                    this._sourceMaxZoom = this._configuredMaxZoom === false
                        ? header.maxZoom : Math.min(this._configuredMaxZoom, header.maxZoom);
                }
                return header;
            });
            // Requests report initialization failures through onTileError.
            this._sourceReady.catch(function () { });
        }
    }

    _loadTile(tileContext) {
        tileContext.loaded = false;
        tileContext.loading = true;
        tileContext.released = false;
        tileContext.generation = this._sourceGeneration;
        tileContext.requestId = (tileContext.requestId || 0) + 1;
        this._updateLoadedTiles();
        if (this._sourceType === 'pmtiles') {
            this._pmtilesRequest(tileContext);
        } else {
            this._xhrRequest(tileContext);
        }
    }

    _isCurrentTile(tileContext, requestId) {
        return tileContext.generation === this._sourceGeneration &&
            tileContext.requestId === requestId && !tileContext.released &&
            this.map.getZoom() === tileContext.zoom;
    }

    async _pmtilesRequest(tileContext) {
        var requestId = tileContext.requestId;
        var archive = this._pmtiles;
        var pending = this._pendingTiles;
        try {
            var header = await this._sourceReady;
            if (!this._isCurrentTile(tileContext, requestId)) return;
            // The header is asynchronous: calculate overzoom after it is available.
            tileContext.parentId = this._getParentId(tileContext.id);
            var tile = this.getTileObject(tileContext.parentId || tileContext.id);
            var width = Math.pow(2, tile.zoom);
            if (tile.y < 0 || tile.y >= width || tile.zoom < header.minZoom) {
                this._finishTile(tileContext);
                return;
            }
            var x = ((tile.x % width) + width) % width;
            var key = this.getTileId(tile.zoom, x, tile.y);
            var request = pending.get(key);
            if (!request) {
                request = archive.getZxy(tile.zoom, x, tile.y);
                pending.set(key, request);
                request.then(() => pending.delete(key), () => pending.delete(key));
            }
            var result = await request;
            if (!this._isCurrentTile(tileContext, requestId)) return;
            if (result) {
                this._xhrResponseOk(tileContext, result.data);
            }
            this._finishTile(tileContext);
        } catch (error) {
            if (this._isCurrentTile(tileContext, requestId)) {
                this._finishTile(tileContext, error);
            }
        }
    }

    _updateLoadedTiles() {
        this.loadedTilesLen = Object.keys(this._visibleTiles).filter(id => this._visibleTiles[id].loaded).length;
    }

    _finishTile(tileContext, error) {
        tileContext.loaded = true;
        tileContext.loading = false;
        this._drawDebugInfo(tileContext);
        if (!error) this._setTileDrawn(tileContext);
        this._updateLoadedTiles();
        if (error) this._onTileError(error, tileContext);
    }

    _xhrRequest(tileContext) {
        var self = this;
        var requestId = tileContext.requestId;

        var id = tileContext.parentId || tileContext.id;
        var tile = this.getTileObject(id);

        var src = this._url
            .replace("{z}", tile.zoom)
            .replace("{x}", tile.x)
            .replace("{y}", tile.y);

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onload = function () {
            if (!self._isCurrentTile(tileContext, requestId)) return;
            try {
                if (xmlHttpRequest.status === 200 && xmlHttpRequest.response) {
                    self._xhrResponseOk(tileContext, xmlHttpRequest.response);
                } else if (xmlHttpRequest.status !== 204 && xmlHttpRequest.status !== 404) {
                    throw new Error('Tile request failed: HTTP ' + xmlHttpRequest.status);
                }
                self._finishTile(tileContext);
            } catch (error) {
                self._finishTile(tileContext, error);
            }
        };
        xmlHttpRequest.onerror = function () {
            if (self._isCurrentTile(tileContext, requestId)) {
                self._finishTile(tileContext, new Error('Tile request failed: ' + src));
            }
        };
        xmlHttpRequest.open('GET', src, true);
        for (var header in this._xhrHeaders) {
            xmlHttpRequest.setRequestHeader(header, this._xhrHeaders[header]);
        }
        xmlHttpRequest.responseType = 'arraybuffer';
        xmlHttpRequest.send();
    }

    _xhrResponseOk(tileContext, response) {
        if (this.map.getZoom() != tileContext.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);
        this._drawVectorTile(vectorTile, tileContext);
    }
    
    tileLoaded() {
        return new Promise(resolve => {
            const check = () => {
                this._updateLoadedTiles();
                if (Object.keys(this._visibleTiles).every(id => this._visibleTiles[id].loaded)) {
                    resolve(true);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    _setTileDrawn(tileContext) {
        if (!this._cache) return;
        this._tilesDrawn[tileContext.id] = tileContext;
    }

    deleteTileDrawn(id) {
        delete this._tilesDrawn[id];
    }

    _resetTileDrawn() {
        this._tilesDrawn = Object.create(null);
    }

    _drawVectorTile(vectorTile, tileContext) {
        if (this._visibleLayers) {
            for (var i = 0, length = this._visibleLayers.length; i < length; i++) {
                var key = this._visibleLayers[i];
                if (vectorTile.layers[key]) {
                    var vectorTileLayer = vectorTile.layers[key];
                    this._drawVectorTileLayer(vectorTileLayer, key, tileContext);
                }
            }
        } else {
            for (var key in vectorTile.layers) {
                var vectorTileLayer = vectorTile.layers[key];
                this._drawVectorTileLayer(vectorTileLayer, key, tileContext);
            }
        }
        tileContext.vectorTile = vectorTile;
        this._drawDebugInfo(tileContext);
        this._setTileDrawn(tileContext);
    }

    _drawVectorTileLayer(vectorTileLayer, key, tileContext) {
        if (!this.mVTLayers[key]) {
            this.mVTLayers[key] = this._createMVTLayer(key);
        }
        var mVTLayer = this.mVTLayers[key];
        mVTLayer.parseVectorTileFeatures(this, vectorTileLayer.parsedFeatures, tileContext);
    }

    _createMVTLayer(key) {
        var options = {
            getIDForLayerFeature: this.getIDForLayerFeature,
            filter: this._filter,
            style: this.style,
            name: key,
            customDraw: this._customDraw
        };
        return new MVTLayer(options);
    }

    _drawDebugInfo(tileContext) {
        if (!this._debug) return;
        var tile = this.getTileObject(tileContext.id)
        var width = this._tileSize;
        var height = this._tileSize;
        var context2d = tileContext.canvas.getContext('2d');
        context2d.strokeStyle = '#000000';
        context2d.fillStyle = '#FFFF00';
        context2d.strokeRect(0, 0, width, height);
        context2d.font = "12px Arial";
        context2d.fillRect(0, 0, 5, 5);
        context2d.fillRect(0, height - 5, 5, 5);
        context2d.fillRect(width - 5, 0, 5, 5);
        context2d.fillRect(width - 5, height - 5, 5, 5);
        context2d.fillRect(width / 2 - 5, height / 2 - 5, 10, 10);
        context2d.strokeText(tileContext.zoom + ' ' + tile.x + ' ' + tile.y, width / 2 - 30, height / 2 - 10);
    }

    onClick(event, callbackFunction, options) {
        this._multipleSelection = (options && options.multipleSelection) || false;
        options = this._getMouseOptions(options, false);
        this._mouseEvent(event, callbackFunction, options);
    }

    onMouseHover(event, callbackFunction, options) {
        this._multipleSelection = (options && options.multipleSelection) || false;
        options = this._getMouseOptions(options, true);
        this._mouseEvent(event, callbackFunction, options);
    }

    _getMouseOptions(options, mouseHover) {
        return {
            mouseHover: mouseHover,
            setSelected: options.setSelected || false,
            toggleSelection: (options.toggleSelection === undefined || options.toggleSelection),
            limitToFirstVisibleLayer: options.limitToFirstVisibleLayer || false,
            delay: options.delay || 0
        }
    }

    _mouseEvent(event, callbackFunction, options) {
        if (!event.pixel || !event.latLng) return;
        
        if (options.delay == 0) {
            return this._mouseEventContinue(event, callbackFunction, options);
        }

        this.event = event;
        var me = this;
        setTimeout(function () {
            if (event != me.event) return;            
            me._mouseEventContinue(me.event, callbackFunction, options);
        }, options.delay, event);
        
       
    }
    _mouseEventContinue(event, callbackFunction, options) {
        callbackFunction = callbackFunction || function () { };
        var limitToFirstVisibleLayer = options.limitToFirstVisibleLayer || false;
        var zoom = this.map.getZoom();
        var tile = MERCATOR.getTileAtLatLng(event.latLng, zoom);
        var id = this.getTileId(tile.z, tile.x, tile.y);
        var tileContext = this._visibleTiles[id];
        if (!tileContext) {
            return;
        }
        event.tileContext = tileContext;
        event.tilePoint = MERCATOR.fromLatLngToTilePoint(this.map, event);

        var clickableLayers = this._clickableLayers || Object.keys(this.mVTLayers) || [];
        for (var i = clickableLayers.length - 1; i >= 0; i--) {
            var key = clickableLayers[i];
            var layer = this.mVTLayers[key];
            if (layer) {
                var event = layer.handleClickEvent(event, this);
                this._mouseSelectedFeature(event, callbackFunction, options);
                if (limitToFirstVisibleLayer && event.feature) {
                    break;
                }
            }
        }
    }

    _mouseSelectedFeature(event, callbackFunction, options) {
        if (options.setSelected) {
            var feature = event.feature;
            if (feature) {
                if (options.mouseHover) {
                    if (!feature.selected) {
                        feature.select();
                    }
                }
                else {
                    if (options.toggleSelection) {
                        feature.toggle();
                    }
                    else {
                        if (!feature.selected) {
                            feature.select();
                        }
                    }                    
                }
            }
            else {
                if (options.mouseHover) {
                    this.deselectAllFeatures();
                }
            }
        }
        callbackFunction(event);
    }

    deselectAllFeatures() {        
        var zoom = this.map.getZoom();
        var tilesToRedraw = [];        
        const previousSelection = this._selectedFeatures;
        this._selectedFeatures = Object.create(null);
        for (var featureId in previousSelection) {
            var mVTFeature = previousSelection[featureId];
            if (!mVTFeature) continue;
            mVTFeature.setSelected(false);
            var tiles = mVTFeature.getTiles();
            for (var id in tiles) {
                this.deleteTileDrawn(id);
                var idObject = this.getTileObject(id);
                if (idObject.zoom == zoom) {
                    tilesToRedraw[id] = true;
                }
            }
        }        
        this.redrawTiles(tilesToRedraw);
    }

    _restoreSelectedFeature(mVTFeature) {
        // Parsing a tile restores selection state without triggering another redraw.
        this._selectedFeatures[mVTFeature.featureId] = mVTFeature;
    }

    featureSelected(mVTFeature) {
        if (this._selectedFeatures[mVTFeature.featureId] === mVTFeature) return;
        if (!this._multipleSelection) {
            this.deselectAllFeatures();
        }
        this._selectedFeatures[mVTFeature.featureId] = mVTFeature;
    }

    featureDeselected(mvtFeature) {
        delete this._selectedFeatures[mvtFeature.featureId];
    }

    setSelectedFeatures(featuresIds) {
        if (featuresIds.length > 1) {
            this._multipleSelection = true;
        }
        this.deselectAllFeatures();
        for (var i = 0, length = featuresIds.length; i < length; i++) {
            var featureId = featuresIds[i];
            this._selectedFeatures[featureId] = false;
            for (var key in this.mVTLayers) {
                this.mVTLayers[key].setSelected(featureId);
            }
        }
    }

    isFeatureSelected(featureId) {
        return this._selectedFeatures[featureId] != undefined;
    }

    getSelectedFeatures() {
        var selectedFeatures = [];
        for (var featureId in this._selectedFeatures) {
            selectedFeatures.push(this._selectedFeatures[featureId]);
        }
        return selectedFeatures;
    }

    getSelectedFeaturesInTile(tileContextId) {
        var selectedFeatures = [];
        for (var featureId in this._selectedFeatures) {
            var selectedFeature = this._selectedFeatures[featureId];
            if (!selectedFeature) continue;
            for (var tile in selectedFeature.tiles) {
                if (tile == tileContextId) {
                    selectedFeatures.push(selectedFeature);
                }
            }
        }
        return selectedFeatures;
    }

    setFilter(filter, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._filter = filter;
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setFilter(filter);
        }
        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    setStyle(style, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this.style = style
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setStyle(style);
        }

        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    setVisibleLayers(visibleLayers, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._visibleLayers = visibleLayers;
        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    getVisibleLayers() {
        return this._visibleLayers;
    }

    setClickableLayers(clickableLayers) {
        this._clickableLayers = clickableLayers;
    }

    redrawAllTiles() {
        this._resetTileDrawn();        
        this.redrawTiles(this._visibleTiles);
    }

    redrawTiles(tiles) {
        for (var id in tiles) {
            this.redrawTile(id);
        }
    }

    redrawTile(id) {
        this.deleteTileDrawn(id);        
        var tileContext = this._visibleTiles[id];
        if (!tileContext) return;
        if (!tileContext.vectorTile) {
            if (!tileContext.loading) this._loadTile(tileContext);
            return;
        }
        this.clearTile(tileContext.canvas);
        this._drawVectorTile(tileContext.vectorTile, tileContext);
    }

    clearTile(canvas) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setUrl(url, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._url = url;
        this._initializeSource();
        this._resetMVTLayers();
        this._resetTileDrawn();
        for (var id in this._visibleTiles) {
            var tileContext = this._visibleTiles[id];
            tileContext.vectorTile = null;
            tileContext.loaded = false;
            tileContext.loading = false;
            this.clearTile(tileContext.canvas);
            if (redrawTiles) this._loadTile(tileContext);
        }
        this._updateLoadedTiles();
    }
}
