 /* jshint esversion:6 */
 $(function() {
     'use strict';
     let $mask = $('.mask'),
         $taskDetail = $('.task-detail'),
         taskList = [];
     init();
     // 监听添加任务
     $('.add-task').submit(e => {
         const newTask = {
                 title: '',
                 complete: false,
                 desc: '',
                 informed: false,
                 date: '2018/01/01 00:00',
             },
             input = $(this).find('input');
         e.preventDefault();
         newTask.title = input.val();
         if (/^\s*$/.test(newTask.title)) return;
         else input.val('');
         addTask(newTask);
     });
     // 监听页面点击
     $('body').click(e => {
         const tg = e.target,
             className = tg.className,
             action = {
                 delete: removeTask,
                 detail: showDetail,
                 mask: hideMask,
                 checkbox: compeleteTask,
                 clear: clear,
             };
         if(action[className]) action[className](tg.parentNode.id);
     });

     function init() {
         taskList = store.get('taskList') || [];
         if (taskList.length) renderTaskList();
         remindCheck();
     }

     function addTask(newTask) {
         taskList.unshift(newTask);
         refresh();
     }

     function clear() {
         const callback = () => {
             rmAlert();
             taskList = [];
             refresh();
         };
         myAlert('清空所有任务', callback);
     }

     function removeTask(index) {
         const callback = e => {
             taskList.splice(e.data.index, 1);
             rmAlert();
             refresh();
         };
         myAlert(`删除 '${taskList[index].title}' `, callback, { index });
     }

     function myAlert(text, callback, data = {}) {
         const alertText = `<div class="alert">
                                <p class='alertText'>确定${text}?</p>
                                <button class='confirm' type='button'>确定</button>
                                <button class='cancel' type='button'>取消</button>
                            </div>`;
         $mask.show();
         $('.container').append($(alertText));
         $('.confirm').click(data, callback);
         $('.cancel').click(rmAlert);
     }

     function showDetail(index) {
         renderTaskDetail(index);
         $mask.show();
         $taskDetail.show();
     }

     function hideMask() {
         $mask.hide();
         $taskDetail.hide().html('');
         rmAlert();
     }

     function rmAlert() {
         $mask.hide();
         $('.alert').remove();
     }

     function compeleteTask(index) {
         let i = 0,
             task = taskList[index];
         if (task.complete) { task.complete = false; } else {
             task.complete = true;
             taskList.splice(index, 1);
             for (const [index, elem] of taskList.entries()) {
                 if (!elem.complete) i++;
             }
             taskList.splice(i, 0, task);
         }
         refresh();
     }

     function refresh() {
         store.set('taskList', taskList);
         renderTaskList();
     }

     function renderTaskList() {
         let task = '';
         for (const [index, elem] of taskList.entries()) {
             task += taskTemplate(elem, index);
         }
         $('.task-list').html('').append($(task));
         $('task-item').removeClass('complete');
         $("[checked]").parent().addClass('complete');
     }

     function taskTemplate(item, index) {
         const checked = item.complete ? "checked" : '',
             template = `<div class='task-item' id=${index}>
                             <input type='checkbox' class='checkbox' ${checked}>
                             <span class='task-title'>${item.title}</span>
                             <span class='delete'>删除</span>
                             <span class='detail'>详细</span>
                         </div>`;
         return template;
     }

     function renderTaskDetail(index) {
         const item = taskList[index],
             template = `<div class='detail-title'>${item.title}</div>
                         <input type="text" value='${item.title}' id='title'>
                         <textarea id='desc'>${item.desc}</textarea>
                         <span>提醒时间</span>
                         <input type='text' id='date' value='${item.date}'>
                         <button type='button' class='update'>更新</button>`;
         $taskDetail.append($(template)).css('top', index * 44 + 44 + 'px');
         $('#date').datetimepicker();
         update(item);
     }

     function update(item) {
         $('.detail-title').dblclick(function() {
             $(this).hide();
             $('#title').show();
         });
         $('.update').click(e => {
             Object.assign(item, {
                 title: $('#title').val(),
                 desc: $('#desc').val(),
                 date: $('#date').val(),
             });
             refresh();
             hideMask();
         });
     }

     function remindCheck() {
         setInterval(() => {
             for (const [index, elem] of taskList.entries()) {
                 if (!elem.complete && !elem.informed) {
                     const currentTime = (new Date()).getTime(),
                         taskTime = (new Date(elem.date)).getTime();
                     if (currentTime > taskTime) {
                         elem.informed = true;
                         store.set('taskList', taskList);
                         notice(elem);
                     }
                 }
             }
         }, 1000);
     }

     function notice(item) {
         $('.hint-tone')[0].play();
         $('body').prepend($(`<div class="notice"><span>'${item.title}' 时间已到</span>
                                 <button type="button">知道了</button>
                             </div>`));
         $('.notice button').click(function() { $(this).parent().remove(); });
     }
 });
