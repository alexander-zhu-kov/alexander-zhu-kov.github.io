/* Портфолио А. Жукова — общий скрипт. Каждый блок срабатывает, только если его элементы есть на странице. */
(function(){
  var $=function(id){return document.getElementById(id)};
  var fmt=function(n,d){return n.toLocaleString('ru-RU',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})};

  // переключатели «Показать: …» — общий механизм
  function chips(attr,cb){
    var bs=document.querySelectorAll('['+attr+']'); if(!bs.length)return;
    bs.forEach(function(b){b.addEventListener('click',function(){
      bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      cb(b.getAttribute(attr));
    })});
  }

  // копирование контактов
  document.querySelectorAll('.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var el=$(b.dataset.copy), t=el.textContent;
      var done=function(){b.textContent='Скопировано';setTimeout(function(){b.textContent='Копировать'},1500)};
      var sel=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);};
      try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}
    });
  });

  // главная: прогресс «Путь / Версии программы»
  chips('data-prog',function(k){
    document.querySelectorAll('[data-prog-pane]').forEach(function(p){p.hidden=p.dataset.progPane!==k});
  });

  // ---- план-факт ----
  if($('pf-table')){
    var items=[
      ['Плита перекрытия ПК 60.15',2.25,21400],['Панель наружная НС-1',3.10,38600],['Лестничный марш ЛМ 27',0.84,9800],
      ['Ригель РДП 4.56',1.12,14200],['Колонна К-1',0.96,12900],['Блок ФБС 24.4.6',0.54,4300],
      ['Плита балконная ПБ-1',0.62,8700],['Перемычка 2ПБ 17-2',0.07,690]
    ];
    var periods={
      week:{plan:[42,28,12,20,16,90,18,160],fact:[43,27,12,17,16,94,14,160],r:[4,3,1,0,1,0,0,1]},
      month:{plan:[180,120,52,84,66,380,76,700],fact:[184,111,53,71,65,392,61,688],r:[16,11,6,3,4,5,2,3]},
      ytd:{plan:[1560,1040,450,730,570,3300,650,6100],fact:[1571,992,441,662,568,3342,571,6034],r:[92,61,40,28,19,24,12,9]}
    };
    var reasons=['Нет форм / оснастки','Нехватка персонала','Отказ оборудования','Задержка бетона с БСУ','Нет арматуры и закладных','Брак, переделка','Смена приоритетов','Не завершено пропаривание'];
    var cls=function(p){return p>=100?'good':(p>=90?'warn':'bad')};
    var renderPF=function(key){
      var d=periods[key], rows='', tp=0,tf=0,vp=0,vf=0,sp=0,sf=0;
      rows+='<thead><tr><th>Изделие</th><th>План, шт</th><th>Факт, шт</th><th>%</th><th>Факт, м³</th></tr></thead><tbody>';
      items.forEach(function(it,i){
        var p=d.plan[i],f=d.fact[i],pc=f/p*100;
        tp+=p;tf+=f;vp+=p*it[1];vf+=f*it[1];sp+=p*it[2];sf+=f*it[2];
        rows+='<tr><td>'+it[0]+'</td><td>'+fmt(p)+'</td><td>'+fmt(f)+'</td><td><span class="pct '+cls(pc)+'">'+fmt(pc,1)+'%</span></td><td>'+fmt(f*it[1],1)+'</td></tr>';
      });
      var vpc=vf/vp*100;
      rows+='<tr class="total"><td>Итого</td><td>'+fmt(tp)+'</td><td>'+fmt(tf)+'</td><td><span class="pct '+cls(vpc)+'">'+fmt(vpc,1)+'%</span></td><td>'+fmt(vf,1)+'</td></tr></tbody>';
      $('pf-table').innerHTML=rows;
      var spc=sf/sp*100;
      $('pf-kpis').innerHTML=
        '<div class="kpi"><span class="l">Выполнение в м³</span><span class="v">'+fmt(vpc,1)+'%</span><span class="state '+cls(vpc)+'">'+fmt(vf)+' из '+fmt(vp)+' м³</span></div>'+
        '<div class="kpi"><span class="l">Сделка, факт</span><span class="v">'+fmt(sf/1e6,1)+' млн ₽</span><span class="state '+cls(spc)+'">'+fmt(spc,1)+'% от плана</span></div>'+
        '<div class="kpi"><span class="l">Изделий ниже 90%</span><span class="v">'+d.plan.filter(function(p,i){return d.fact[i]/p<.9}).length+' из '+items.length+'</span><span class="state muted">по каждому есть мероприятие</span></div>';
      var mx=Math.max.apply(null,d.r), order=d.r.map(function(v,i){return [v,reasons[i]]}).sort(function(a,b){return b[0]-a[0]}).slice(0,6);
      $('pf-reasons').innerHTML=order.map(function(o){
        return '<div class="bar-row"><span>'+o[1]+'</span><div class="bar-track"><div class="bar-fill" style="width:'+(o[0]/mx*100)+'%"></div></div><span class="num">'+fmt(o[0])+'</span></div>';
      }).join('');
    };
    chips('data-per',renderPF);
    renderPF('month');
  }

  // ---- заказы и готовность к отгрузке ----
  if($('ord-table')){
    // клиент, проект, заказ, срок, готово %, статус, комментарий
    var ords=[
      ['СК «Северный берег»','ЖК «Ладога», корп. 2','З-101','14.10',72,'ok','в плане до срока, запас 4 раб. дня'],
      ['СК «Северный берег»','ЖК «Ладога», корп. 2','З-105','28.10',18,'ok','формовка с 15.10 по плану'],
      ['Мостострой-7','Путепровод км 14','З-102','30.09',64,'late','партия просрочена, отгружено частично'],
      ['ГК «Опора»','Школа на 550 мест','З-103','09.10',41,'risk','ЛМ 30.12.15-4: не хватает мощности формы'],
      ['ГК «Опора»','Школа на 550 мест','З-104','06.10',100,'ready','готово к отгрузке'],
      ['ИП Соколов','Склад, Мурино','З-098','25.09',100,'ready','выполнен и отгружен']
    ];
    var lab={ready:'готово',ok:'в срок',risk:'под угрозой',late:'срыв'};
    var renderOrd=function(f){
      var rows='<thead><tr><th>Клиент · проект</th><th>Заказ</th><th>Срок</th><th>Готово</th><th>Состояние</th></tr></thead><tbody>';
      ords.filter(function(o){return f==='all'||(f==='risk'?(o[5]==='risk'||o[5]==='late'):o[5]===f)}).forEach(function(o){
        rows+='<tr><td><b>'+o[0]+'</b><br><span class="muted" style="font-size:13px">'+o[1]+' · '+o[6]+'</span></td><td>'+o[2]+'</td><td>'+o[3]+'</td><td><span class="meter"><i style="width:'+o[4]+'%"></i></span>'+o[4]+'%</td><td><span class="ord-st '+o[5]+'">'+lab[o[5]]+'</span></td></tr>';
      });
      $('ord-table').innerHTML=rows+'</tbody>';
    };
    chips('data-ord',renderOrd);
    renderOrd('all');
  }

  // ---- простои: график ----
  if($('dt-chart')){
    var weeks=['28','29','30','31','32','33','34','35','36','37','38','39'];
    var vals=[11.8,12.6,10.9,10.2,11.1,9.4,8.8,9.6,7.9,7.1,6.4,6.2];
    var targ=[10,10,10,10,10,10,8,8,8,8,8,8];
    var W=900,H=230,L=40,R=10,T=12,B=30,max=14, cw=(W-L-R)/weeks.length, y=function(v){return T+(H-T-B)*(1-v/max)};
    var s='';
    [0,4,8,12].forEach(function(g){s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(g)+'" y2="'+y(g)+'"/><text x="'+(L-8)+'" y="'+(y(g)+4)+'" text-anchor="end">'+g+'%</text>'});
    var path='';
    weeks.forEach(function(w,i){
      var x=L+i*cw, bw=cw*0.56, bx=x+(cw-bw)/2, v=vals[i], over=v>targ[i];
      s+='<rect x="'+bx+'" y="'+y(v)+'" width="'+bw+'" height="'+(y(0)-y(v))+'" rx="2" fill="var('+(over?'--bad':'--accent')+')"/>';
      s+='<text x="'+(x+cw/2)+'" y="'+(y(v)-5)+'" text-anchor="middle">'+String(v).replace('.',',')+'</text>';
      s+='<text x="'+(x+cw/2)+'" y="'+(H-10)+'" text-anchor="middle">нед '+w+'</text>';
      path+=(i?'L':'M')+x+' '+y(targ[i])+' L'+(x+cw)+' '+y(targ[i])+' ';
    });
    s+='<path class="target" d="'+path+'"/>';
    s+='<text x="'+(L+6*cw+4)+'" y="'+(y(8)-6)+'">цель снижена до 8%</text>';
    $('dt-chart').innerHTML=s;
  }

  // ---- QR-знак (декоративный) ----
  if($('qr')){
    var q='', seed=7, rnd=function(){seed=(seed*9301+49297)%233280;return seed/233280};
    var finder=function(x,y){q+='<rect x="'+x+'" y="'+y+'" width="7" height="7"/><rect x="'+(x+1)+'" y="'+(y+1)+'" width="5" height="5" style="fill:var(--bg)"/><rect x="'+(x+2)+'" y="'+(y+2)+'" width="3" height="3"/>'};
    finder(0,0);finder(14,0);finder(0,14);
    for(var yy=0;yy<21;yy++)for(var xx=0;xx<21;xx++){
      if((xx<8&&yy<8)||(xx>12&&yy<8)||(xx<8&&yy>12))continue;
      if(rnd()>.52)q+='<rect x="'+xx+'" y="'+yy+'" width="1" height="1"/>';
    }
    $('qr').innerHTML=q;
  }

  // ---- таймер простоя ----
  if($('timer')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var t=17*60+42, el=$('timer');
    setInterval(function(){t++;var h=Math.floor(t/3600),m=Math.floor(t%3600/60),sec=t%60;el.textContent=[h,m,sec].map(function(n){return String(n).padStart(2,'0')}).join(':')},1000);
  }

  // ---- увеличение снимков ----
  (function(){
    var dlg=$('lb'); if(!dlg||!dlg.showModal)return;
    var im=dlg.querySelector('img'), cap=dlg.querySelector('.lb-cap');
    document.querySelectorAll('.shot').forEach(function(b){
      b.addEventListener('click',function(){var i=b.querySelector('img');im.src=i.src;im.alt=i.alt;cap.textContent=i.alt;dlg.showModal()});
    });
    dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('.lb-close'))dlg.close()});
  })();

  // ---- Ямадзуми ----
  if($('ts-chart')){
    var ops=['Армирование','Укладка бетона','Вибрирование','Заглаживание','Съём с поддона'];
    var data={before:[[34,10,14],[40,8,22],[28,6,6],[22,8,18],[18,12,20]],after:[[34,9,5],[40,7,8],[28,5,3],[22,7,6],[18,10,7]]};
    var takt=60,W2=900,H2=280,L2=46,R2=16,T2=14,B2=34,mx2=80;
    var y2=function(v){return T2+(H2-T2-B2)*(1-v/mx2)};
    var draw=function(key){
      var d=data[key],s2='',cw2=(W2-L2-R2)/ops.length,sum=d.map(function(r){return r[0]+r[1]+r[2]});
      [0,20,40,60,80].forEach(function(g){s2+='<line class="grid" x1="'+L2+'" x2="'+(W2-R2)+'" y1="'+y2(g)+'" y2="'+y2(g)+'"/><text x="'+(L2-8)+'" y="'+(y2(g)+4)+'" text-anchor="end">'+g+' с</text>'});
      var bn=sum.indexOf(Math.max.apply(null,sum));
      d.forEach(function(r,i){
        var x=L2+i*cw2,bw=cw2*0.52,bx=x+(cw2-bw)/2,acc=0;
        ['--good','--warn','--bad'].forEach(function(c,j){var v=r[j];s2+='<rect x="'+bx+'" y="'+y2(acc+v)+'" width="'+bw+'" height="'+(y2(acc)-y2(acc+v))+'" fill="var('+c+')"/>';acc+=v});
        s2+='<text x="'+(x+cw2/2)+'" y="'+(y2(acc)-6)+'" text-anchor="middle"'+(i===bn?' style="fill:var(--ink);font-weight:600"':'')+'>'+acc+' с</text>';
        s2+='<text x="'+(x+cw2/2)+'" y="'+(H2-12)+'" text-anchor="middle"'+(i===bn?' style="fill:var(--ink)"':'')+'>'+ops[i]+'</text>';
      });
      s2+='<line class="target" x1="'+L2+'" x2="'+(W2-R2)+'" y1="'+y2(takt)+'" y2="'+y2(takt)+'"/><text x="'+(W2-R2-4)+'" y="'+(y2(takt)-6)+'" text-anchor="end">такт '+takt+' с</text>';
      $('ts-chart').innerHTML=s2;
      var tot=sum.reduce(function(a,b){return a+b},0),waste=d.reduce(function(a,r){return a+r[2]},0),bal=tot/(ops.length*Math.max.apply(null,sum))*100;
      var over=sum[bn]>takt;
      $('ts-kpis').innerHTML=
        '<div class="kpi"><span class="l">Узкое место</span><span class="v">'+sum[bn]+' с</span><span class="state '+(over?'bad':'good')+'">'+ops[bn]+(over?' · выше такта':' · в такте')+'</span></div>'+
        '<div class="kpi"><span class="l">Потери (муда)</span><span class="v">'+fmt(waste/tot*100,0)+'%</span><span class="state '+(waste/tot>.2?'bad':'good')+'">'+waste+' с на изделие</span></div>'+
        '<div class="kpi"><span class="l">Баланс линии</span><span class="v">'+fmt(bal,0)+'%</span><span class="state muted">'+(key==='after'?'узкое место 70 → '+sum[bn]+' с: линия успевает за тактом':'линия не успевает за тактом')+'</span></div>';
    };
    chips('data-ts',draw);
    draw('before');
  }

  // ---- тепловые карты загрузки ----
  function heatmap(id,days,rows,skipLabel){
    var el=$(id); if(!el)return;
    var h='<div class="h"></div>'+days.map(function(d){return '<div class="h">'+d+'</div>'}).join('');
    rows.forEach(function(r){
      h+='<div class="m">'+r[0]+'</div>';
      r[1].forEach(function(v){
        if(v<0){h+='<div class="c" style="background:var(--soft);color:var(--muted)">'+skipLabel+'</div>';return}
        var c=v>100?'bad':(v>=85?'warn':'good');
        h+='<div class="c" style="background:var(--'+c+'-soft);color:var(--'+c+')">'+v+'</div>';
      });
    });
    el.style.gridTemplateColumns='minmax(150px,1.6fr) repeat('+days.length+',minmax(40px,1fr))';
    el.innerHTML=h;
  }
  heatmap('forms',['пн 29','вт 30','ср 1','чт 2','пт 3','пн 6','вт 7','ср 8','чт 9','пт 10'],[
    ['Формы ПК 60.15 (6 шт)',[83,83,100,100,83,83,100,83,83,67]],
    ['Формы НС-1 (4 шт)',[75,100,100,125,100,75,100,100,75,75]],
    ['Формы ПБ-1 (2 шт)',[100,150,100,100,50,100,100,150,100,50]],
    ['Кассета ФБС (1 шт)',[80,90,90,70,90,90,90,70,80,60]]
  ],'—');
  var eq=[
    ['Бетоносмеситель БСУ-1',[78,82,88,91,84,80,86,93,97,88]],
    ['Бетоносмеситель БСУ-2',[72,74,-1,79,81,76,78,83,85,80]],
    ['Пост формовки ПФ-1',[92,96,104,98,95,101,112,108,99,94]],
    ['Пост формовки ПФ-2',[81,85,87,90,86,84,89,92,95,90]],
    ['Станок гибки арматуры',[64,70,72,68,75,71,77,74,70,66]],
    ['Сварочный пост каркасов',[88,93,97,102,96,91,99,106,103,95]]
  ];
  heatmap('heat',['пн 12','вт 13','ср 14','чт 15','пт 16','пн 19','вт 20','ср 21','чт 22','пт 23'],eq,'ППР');
  heatmap('heat2',['пн 12','вт 13','ср 14','чт 15','пт 16','пн 19','вт 20','ср 21','чт 22','пт 23'],eq,'ППР');
})();
