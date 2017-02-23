$(function() {
     'use strict';
     let $notice = $('.notice'),
         $mask = $('.mask'),
         $addTask = $('.add-task'),
         $taskList = $('.task-list'),
         $taskDetail = $('.task-detail'),
         $alert = $('.alert'),
         taskList = [];
     init();
     // 监听任务添加
     $addTask.submit(e => {
         const input = $(this).find('input'),
             title = input.val();
         e.preventDefault();
         if (/^\s*$/.test(title)) return; // 如果任务无内容，添加无效
         else input.val('');
         const newTask = bulidTask(title);
         addTask(newTask);
     });
     // 监听页面点击
     $('body').click(e => {
         const tg = $(e.target),
             className = tg.attr('class'),
             index = tg.parent().data('index');
         act(className, index);
     });
     // 初始化任务列表
     function init() {
         taskList = store.get('taskList') || [];
         if (taskList.length) renderTaskList();
         intervalCheck();
     }
     // 新建任务
     function bulidTask(title) {
         return {
             title,
             complete: false,
             desc: '',
             informed: false,
             date: '2018/01/01 00:00',
         };
     }
     // 添加任务
     function addTask(newTask) {
         taskList.unshift(newTask);
         refresh();
     }
     // 响应点击事件
     function act(className, index) {
         const action = {
             delete: removeTask,
             detail: showDetail,
             mask: hideMask,
             checkbox: compeleteTask,
             clear: clear,
             know: hideNotice,
         };
         if (action[className]) action[className](index);
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
             console.log(1);
             taskList.splice(e.data.index, 1);
             rmAlert();
             refresh();
         };
         myAlert(`删除 '${taskList[index].title}' `, callback, { index });
     }
     // 模态框
     function myAlert(text, callback, data = {}) {
         $alert.show()
             .find('p').html(`确定${text}?`)
             .next().one('click', data, callback)
             .next().one('click', rmAlert);
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
     // 隐藏模态框
     function rmAlert() {
         $mask.hide();
         $alert.hide();
     }
     // 标记任务完成
     function compeleteTask(index) {
         let i = 0,
             task = taskList[index];
         if (task.complete) { task.complete = false; } else {
             task.complete = true;
             taskList.splice(index, 1);
             taskList.forEach((elem) => {
                 if (!elem.complete) i++;
             });
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
         let incompleteList = '',
             completeList = '',
             list = '';
         for (const [index, elem] of taskList.entries()) {
             if (!elem.complete) { incompleteList += taskTemplate(elem, index); } 
             else { completeList += taskTemplate(elem, index); }
         }
         list = incompleteList + completeList;
         $taskList.html('').append($(list))
             .children().removeClass('complete');
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
         $taskDetail.append($(template)).css('top', index * 3.9 + 4.4 + 'rem')
             .find('#date').datetimepicker();
         update(item);
     }
     // 监听修改任务
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
     // 间歇遍历任务
     function intervalCheck() {
         setInterval(() => {
             taskList.forEach(check);
         }, 1000);
     }
     // 判断任务是否到时
     function check(item) {
         if (!item.complete && !item.informed) {
             const currentTime = (new Date()).getTime(),
                 taskTime = (new Date(item.date)).getTime();
             if (currentTime > taskTime) {
                 item.informed = true;
                 store.set('taskList', taskList);
                 notice(item);
             }
         }
     }
     // 任务提醒
     function notice(item) {
         $('audio')[0].play();
         $notice.show()
             .find('span').append(`'${item.title}' 时间已到 `);
     }
     // 隐藏提醒
     function hideNotice() {
         $notice.hide().find('span').html('');
     }
});
