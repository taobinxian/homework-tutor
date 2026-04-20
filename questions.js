// 题库工具函数与初始化
(function(root){
  'use strict';

  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const shuffle=a=>{
    const r=[...a];
    for(let i=r.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [r[i],r[j]]=[r[j],r[i]];
    }
    return r;
  };
  const pick=a=>a[Math.floor(Math.random()*a.length)];

  const QB={};
  for(let g=1;g<=6;g++) QB[g]={math:[],chinese:[],english:[],science:[]};

  const SEMESTER_LABELS={upper:'上册',lower:'下册',unknown:'未标注'};
  const QB_TERM_INDEX={};
  const QB_UNMAPPED=[];
  const QB_ANNOTATION_REPORT={total:0,mapped:0,unmapped:0};

  function uniq(list){
    return [...new Set((list||[]).filter(Boolean).map(String))];
  }

  function cloneMeta(meta){
    if(!meta) return null;
    return {
      semester: meta.semester,
      topic: meta.topic,
      knowledgePoints: Array.isArray(meta.knowledgePoints) ? [...meta.knowledgePoints] : [],
    };
  }

  function normalizeMeta(meta,fallbackTopic){
    const safeMeta=cloneMeta(meta)||{};
    const topic=String(safeMeta.topic||fallbackTopic||'未标注');
    const semester=safeMeta.semester==='upper' || safeMeta.semester==='lower'
      ? safeMeta.semester
      : 'unknown';
    const knowledgePoints=uniq([topic].concat(safeMeta.knowledgePoints||[]));
    return {
      semester,
      semesterLabel: SEMESTER_LABELS[semester]||SEMESTER_LABELS.unknown,
      topic,
      knowledgePoints: knowledgePoints.length ? knowledgePoints : [topic],
    };
  }

  function getOriginalTopic(question){
    if(!question.originalTopic) question.originalTopic=question.topic||'未标注';
    return question.originalTopic;
  }

  function matchesOverride(rule,grade,subject,question,topic){
    if(rule.grade!==grade || rule.subject!==subject) return false;
    if(rule.topic && rule.topic!==topic) return false;
    if(typeof rule.test==='function') return !!rule.test(question);
    if(rule.pattern instanceof RegExp) return rule.pattern.test(question.q||'');
    return false;
  }

  function findQuestionMeta(grade,subject,question){
    const topic=getOriginalTopic(question);
    const overrides=root.QB_CURRICULUM_OVERRIDES||[];
    for(const rule of overrides){
      if(matchesOverride(rule,grade,subject,question,topic)){
        const overrideMeta=typeof rule.meta==='function' ? rule.meta(question) : rule.meta;
        return normalizeMeta(overrideMeta,topic);
      }
    }

    const gradeMap=((root.QB_CURRICULUM_MAP||{})[grade]||{})[subject]||{};
    return normalizeMeta(gradeMap[topic],topic);
  }

  function rebuildQuestionBankIndex(){
    Object.keys(QB_TERM_INDEX).forEach(key=>delete QB_TERM_INDEX[key]);
    for(const gradeKey of Object.keys(QB)){
      const grade=Number(gradeKey);
      QB_TERM_INDEX[grade]={};
      for(const subject of Object.keys(QB[grade])){
        const buckets={upper:[],lower:[],unknown:[]};
        for(const question of QB[grade][subject]){
          const semester=question.semester==='upper' || question.semester==='lower'
            ? question.semester
            : 'unknown';
          buckets[semester].push(question);
        }
        QB_TERM_INDEX[grade][subject]=buckets;
      }
    }
  }

  function finalizeQuestionBank(){
    QB_UNMAPPED.length=0;
    let total=0;
    let mapped=0;

    for(const gradeKey of Object.keys(QB)){
      const grade=Number(gradeKey);
      for(const subject of Object.keys(QB[grade])){
        for(const question of QB[grade][subject]){
          total++;
          const meta=findQuestionMeta(grade,subject,question);
          question.topic=meta.topic;
          question.semester=meta.semester;
          question.semesterLabel=meta.semesterLabel;
          question.knowledgePoints=[...meta.knowledgePoints];
          if(meta.semester==='unknown'){
            QB_UNMAPPED.push({
              grade,
              subject,
              topic:getOriginalTopic(question),
              q:question.q,
              answer:question.answer,
            });
          }else{
            mapped++;
          }
        }
      }
    }

    rebuildQuestionBankIndex();
    QB_ANNOTATION_REPORT.total=total;
    QB_ANNOTATION_REPORT.mapped=mapped;
    QB_ANNOTATION_REPORT.unmapped=QB_UNMAPPED.length;
    return QB_ANNOTATION_REPORT;
  }

  function getQuestionPool(grade,subject,semester){
    const buckets=(((QB_TERM_INDEX[grade]||{})[subject])||{});
    if(semester && buckets[semester]) return buckets[semester];
    return (QB[grade]&&QB[grade][subject])||[];
  }

  function getAvailableSemesters(grade,subject){
    const buckets=(((QB_TERM_INDEX[grade]||{})[subject])||{});
    return ['upper','lower'].filter(key=>Array.isArray(buckets[key]) && buckets[key].length);
  }

  root.rand=rand;
  root.shuffle=shuffle;
  root.pick=pick;
  root.QB=QB;
  root.QB_TERM_INDEX=QB_TERM_INDEX;
  root.QB_UNMAPPED=QB_UNMAPPED;
  root.QB_ANNOTATION_REPORT=QB_ANNOTATION_REPORT;
  root.QB_SEMESTER_LABELS=SEMESTER_LABELS;
  root.finalizeQuestionBank=finalizeQuestionBank;
  root.getQuestionPool=getQuestionPool;
  root.getAvailableSemesters=getAvailableSemesters;
})(typeof globalThis!=='undefined' ? globalThis : this);
