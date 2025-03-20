"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[995],{9995:(e,t,a)=>{a.r(t),a.d(t,{default:()=>r});var l=a(6540),n=a.n(l);const r=e=>{const[t,a]=(0,l.useState)({difficulty:"",target:""}),[r,i]=(0,l.useState)(exercisesDatabase),[o,c]=(0,l.useState)([]),[s,u]=(0,l.useState)({title:"",description:""}),m=e=>{const{name:t,value:l}=e.target;a((e=>({...e,[t]:l})))};return(0,l.useEffect)((()=>{let e=exercisesDatabase;t.difficulty&&(e=e.filter((e=>e.difficulty===t.difficulty))),t.target&&(e=e.filter((e=>e.target===t.target))),i(e)}),[t]),n().createElement("div",null,n().createElement("h1",null,"Workout Posting Page"),n().createElement("div",null,n().createElement("label",null,"Difficulty:",n().createElement("select",{name:"difficulty",onChange:m},n().createElement("option",{value:""},"All"),n().createElement("option",{value:"Beginner"},"Beginner"),n().createElement("option",{value:"Intermediate"},"Intermediate"),n().createElement("option",{value:"Advanced"},"Advanced"))),n().createElement("label",null,"Target Muscle:",n().createElement("select",{name:"target",onChange:m},n().createElement("option",{value:""},"All"),n().createElement("option",{value:"Chest"},"Chest"),n().createElement("option",{value:"Legs"},"Legs"),n().createElement("option",{value:"Back"},"Back"),n().createElement("option",{value:"Shoulders"},"Shoulders"),n().createElement("option",{value:"Arms"},"Arms")))),n().createElement("div",{id:"exerciseList"},r.map((e=>n().createElement("div",{key:e.id},n().createElement("h2",null,e.name),n().createElement("img",{src:e.image,alt:e.name}),n().createElement("p",null,e.description),n().createElement("button",{onClick:()=>(e=>{c((t=>t.some((t=>t.id===e.id))?t.filter((t=>t.id!==e.id)):[...t,e]))})(e)},o.some((t=>t.id===e.id))?"Remove":"Add"))))),n().createElement("div",null,n().createElement("input",{type:"text",placeholder:"Workout Title",value:s.title,onChange:e=>u({...s,title:e.target.value})}),n().createElement("textarea",{placeholder:"Workout Description",value:s.description,onChange:e=>u({...s,description:e.target.value})})),n().createElement("button",{onClick:async()=>{const e={title:s.title,description:s.description,exercises:o.map((e=>e.id))};try{const t=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(t.ok){const e=await t.json();alert("Workout Submitted Successfully!"),console.log(e)}else{const e=await t.json();alert("Error submitting workout: "+e.message)}}catch(e){console.error("Error:",e),alert("Error submitting workout!")}}},"Submit Workout"))}}}]);