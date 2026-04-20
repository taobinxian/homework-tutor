// 题库工具函数与初始化
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r};
const pick=a=>a[Math.floor(Math.random()*a.length)];

const QB={};
for(let g=1;g<=6;g++) QB[g]={math:[],chinese:[],english:[],science:[]};
// 各年级题库从 grade1.js ~ grade6.js 加载
