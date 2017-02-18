var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();


$(function () {
    'use strict';

    var _this = this;

    var $notice = $('.notice'),
        $mask = $('.mask'),
        $addTask = $('.add-task'),
        $taskList = $('.task-list'),
        $taskDetail = $('.task-detail'),
        $alert = $('.alert'),
        taskList = [];
    init();
    // 监听任务添加
    $addTask.submit(function (e) {
        var input = $(_this).find('input'),
            title = input.val();
        e.preventDefault();
        if (/^\s*$/.test(title)) return; // 如果任务无内容，添加无效
        else input.val('');
        var newTask = bulidTask(title);
        addTask(newTask);
    });
    // 监听页面点击
    $('body').click(function (e) {
        var tg = $(e.target),
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
            title: title,
            complete: false,
            desc: '',
            informed: false,
            date: '2018/01/01 00:00'
        };
    }
    // 添加任务
    function addTask(newTask) {
        taskList.unshift(newTask);
        refresh();
    }
    // 响应点击事件
    function act(className, index) {
        var action = {
            delete: removeTask,
            detail: showDetail,
            mask: hideMask,
            checkbox: compeleteTask,
            clear: clear,
            know: hideNotice
        };
        if (action[className]) action[className](index);
    }
    // 清空任务列表
    function clear() {
        var callback = function callback() {
            rmAlert();
            taskList = [];
            refresh();
        };
        myAlert('清空所有任务', callback);
    }
    // 删除任务
    function removeTask(index) {
        var callback = function callback(e) {
            console.log(1);
            taskList.splice(e.data.index, 1);
            rmAlert();
            refresh();
        };
        myAlert('\u5220\u9664 \'' + taskList[index].title + '\' ', callback, { index: index });
    }
    // 模态框
    function myAlert(text, callback) {
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        $alert.show().find('p').html('\u786E\u5B9A' + text + '?').next().one('click', data, callback).next().one('click', rmAlert);
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
        var i = 0,
            task = taskList[index];
        if (task.complete) {
            task.complete = false;
        } else {
            task.complete = true;
            taskList.splice(index, 1);
            taskList.forEach(function (elem) {
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
        var incompleteList = '',
            completeList = '',
            list = '';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = taskList.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2),
                    index = _step$value[0],
                    elem = _step$value[1];

                if (!elem.complete) {
                    incompleteList += taskTemplate(elem, index);
                } else {
                    completeList += taskTemplate(elem, index);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        list = incompleteList + completeList;
        $taskList.html('').append($(list)).children().removeClass('complete');
        $("[checked]").parent().addClass('complete');
    }
    // 任务模板
    function taskTemplate(item, index) {
        var checked = item.complete ? "checked" : '',
            template = '<div class=\'task-item\' data-index=' + index + '>\n                             <input type=\'checkbox\' class=\'checkbox\' ' + checked + '>\n                             <span class=\'task-title\'>' + item.title + '</span>\n                             <span class=\'delete\'>\u5220\u9664</span>\n                             <span class=\'detail\'>\u8BE6\u7EC6</span>\n                         </div>';
        return template;
    }
    // 任务详情模板
    function renderTaskDetail(index) {
        var item = taskList[index],
            template = '<div class=\'detail-title\'>' + item.title + '</div>\n                         <input type="text" value=\'' + item.title + '\' id=\'title\'>\n                         <textarea id=\'desc\'>' + item.desc + '</textarea>\n                         <span>\u63D0\u9192\u65F6\u95F4</span>\n                         <input type=\'text\' id=\'date\' value=\'' + item.date + '\'>\n                         <button type=\'button\' class=\'update\'>\u66F4\u65B0</button>';
        $taskDetail.append($(template)).css('top', index * 3.9 + 4.4 + 'rem').find('#date').datetimepicker();
        update(item);
    }
    // 监听修改任务
    function update(item) {
        $('.detail-title').dblclick(function () {
            $(this).hide();
            $('#title').show();
        });
        $('.update').click(function (e) {
            Object.assign(item, {
                title: $('#title').val(),
                desc: $('#desc').val(),
                date: $('#date').val()
            });
            refresh();
            hideMask();
        });
    }
    // 间歇遍历任务
    function intervalCheck() {
        setInterval(function () {
            taskList.forEach(check);
        }, 1000);
    }
    // 判断任务是否到时
    function check(item) {
        if (!item.complete && !item.informed) {
            var currentTime = new Date().getTime(),
                taskTime = new Date(item.date).getTime();
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
        $notice.show().find('span').append('\'' + item.title + '\' \u65F6\u95F4\u5DF2\u5230 ');
    }
    // 隐藏提醒
    function hideNotice() {
        $notice.hide().find('span').html('');
    }
});