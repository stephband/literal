/* Literal 
   0.6.5
   By Stephen Band
   Built 2023-08-24 22:38 */

import{b as o,c as f}from"../chunk-BMIYSOLB.js";import{g as a,o as h,p as u,s as p,t as d}from"../chunk-R6MLMZDQ.js";var g=/^\/|\.|^https?:\/\//;function O(t){try{return JSON.parse(t)}catch{return t}}function D(t){return g.test(t)?p(t):O(t)}var I=(t,r)=>{throw t},b={construct:function(){let t=o(this),r=t.datas=a.of(),e=t.dataoutput=a.of(),y=t.templates=a.of(),m=this;r.each(n=>{typeof n=="string"?g.test(n)?Promise.resolve(n).then(p).then(s=>e.push(s)).catch(s=>I(s,m,t)):e.push(JSON.parse(n)):e.push(n)}),a.combine({data:e,template:y}).each(n=>{let{template:s,data:i}=n,c=t.renderer=new d(s,{body:document.body,element:m.parentElement,root:document.documentElement});c.push(i),m.replaceWith(c.content)});let l=Object.keys(this.dataset);if(l.length){let n=Object.values(this.dataset);Promise.all(n.map(D)).then(s=>e.push(s.reduce((i,c,w)=>(i[l[w]]=c,i),{})))}}};var W=f("literal-include",b,{data:{attribute:function(t){this.data=t},get:function(){let t=o(this);return t.renderer?t.renderer.data:null},set:function(t){o(this).datas.push(t)}},src:{attribute:function(t){let r=o(this);if(/^#/.test(t)){let e=h(t);r.templates.push(e);return}addLoading(this),u(t).then(e=>{r.templates.push(e),removeLoading(this)})}}});export{W as default};
