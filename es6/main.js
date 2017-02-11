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
         if (action[className]) action[className]($(tg).parent().data('index'));
     });
     // 初始化任务列表
     function init() {
         taskList = store.get('taskList') || [];
         if (taskList.length) renderTaskList();
         remindCheck();
     }
     // 添加任务
     function addTask(newTask) {
         taskList.unshift(newTask);
         refresh();
     }
     // 清空任务列表
     function clear() {
         const callback = () => {
             rmAlert();
             taskList = [];
             refresh();
         };
         myAlert('清空所有任务', callback);
     }
    // 删除任务
     function removeTask(index) {
         const callback = e => {
             taskList.splice(e.data.index, 1);
             rmAlert();
             refresh();
         };
         myAlert(`删除 '${taskList[index].title}' `, callback, { index });
     }
    // 自定义alert
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
    // 显示任务描述，日期
     function showDetail(index) {
         renderTaskDetail(index);
         $mask.show();
         $taskDetail.show();
     }
    // 隐藏遮罩层
     function hideMask() {
         $mask.hide();
         $taskDetail.hide().html('');
         rmAlert();
     }
    // 隐藏alert
     function rmAlert() {
         $mask.hide();
         $('.alert').remove();
     }
    // 标记任务完成
     function compeleteTask(index) {
         let i = 0,
             task = taskList[index];
         if (task.complete) { task.complete = false; } 
         else {
             task.complete = true;
             taskList.splice(index, 1);
             for (const elem in taskList) {
                 if (!elem.complete) i++;
             }
             taskList.splice(i, 0, task);
         }
         refresh();
     }
    // 更新localstorage
     function refresh() {
         store.set('taskList', taskList);
         renderTaskList();
     }
    // 渲染任务列表
     function renderTaskList() {
         let listA = '',
             listB = '',
             list = '';
         for (const [index, elem] of taskList.entries()) {
             if (!elem.complete) { listA += taskTemplate(elem, index); } 
             else { listB += taskTemplate(elem, index); }
         }
         list = listA + listB;
         $('.task-list').html('').append($(list));
         $('task-item').removeClass('complete');
         $("[checked]").parent().addClass('complete');
     }
    // 任务模板
     function taskTemplate(item, index) {
         const checked = item.complete ? "checked" : '',
             template = `<div class='task-item' data-index=${index}>
                             <input type='checkbox' class='checkbox' ${checked}>
                             <span class='task-title'>${item.title}</span>
                             <span class='delete'>删除</span>
                             <span class='detail'>详细</span>
                         </div>`;
         return template;
     }
    // 任务详情模板
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
    // 修改任务
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
    // 任务时间监测
     function remindCheck() {
         setInterval(() => {
             for (const task in taskList) {
                 if (!task.complete && !task.informed) {
                     const currentTime = (new Date()).getTime(),
                         taskTime = (new Date(task.date)).getTime();
                     if (currentTime > taskTime) {
                         task.informed = true;
                         store.set('taskList', taskList);
                         notice(task);
                     }
                 }
             }
         }, 1000);
     }
    // 任务提醒
     function notice(item) {
         $('.hint-tone')[0].play();
         $('body').prepend($(`<div class="notice"><span>'${item.title}' 时间已到</span>
                                 <button type="button">知道了</button>
                             </div>`));
         $('.notice button').click(function() { $(this).parent().remove(); });
     }
 });
