var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

$(function () {
    'use strict';

    var _this = this;

    var $mask = $('.mask'),
        $taskDetail = $('.task-detail'),
        taskList = [];
    init();
    // 监听添加任务
    $('.add-task').submit(function (e) {
        var newTask = {
            title: '',
            complete: false,
            desc: '',
            informed: false,
            date: '2018/01/01 00:00'
        },
            input = $(_this).find('input');
        e.preventDefault();
        newTask.title = input.val();
        if (/^\s*$/.test(newTask.title)) return;else input.val('');
        addTask(newTask);
    });
    // 监听页面点击
    $('body').click(function (e) {
        var tg = e.target,
            className = tg.className,
            action = {
            delete: removeTask,
            detail: showDetail,
            mask: hideMask,
            checkbox: compeleteTask,
            clear: clear
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
            taskList.splice(e.data.index, 1);
            rmAlert();
            refresh();
        };
        myAlert('\u5220\u9664 \'' + taskList[index].title + '\' ', callback, { index: index });
    }
    // 自定义alert
    function myAlert(text, callback) {
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var alertText = '<div class="alert">\n                                <p class=\'alertText\'>\u786E\u5B9A' + text + '?</p>\n                                <button class=\'confirm\' type=\'button\'>\u786E\u5B9A</button>\n                                <button class=\'cancel\' type=\'button\'>\u53D6\u6D88</button>\n                            </div>';
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
        var i = 0,
            task = taskList[index];
        if (task.complete) {
            task.complete = false;
        } else {
            task.complete = true;
            taskList.splice(index, 1);
            for (var elem in taskList) {
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
        var listA = '',
            listB = '',
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
                    listA += taskTemplate(elem, index);
                } else {
                    listB += taskTemplate(elem, index);
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

        list = listA + listB;
        $('.task-list').html('').append($(list));
        $('task-item').removeClass('complete');
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
        $taskDetail.append($(template)).css('top', index * 44 + 44 + 'px');
        $('#date').datetimepicker();
        update(item);
    }
    // 修改任务
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
    // 任务时间监测
    function remindCheck() {
        setInterval(function () {
            for (var task in taskList) {
                if (!task.complete && !task.informed) {
                    var currentTime = new Date().getTime(),
                        taskTime = new Date(task.date).getTime();
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
        $('body').prepend($('<div class="notice"><span>\'' + item.title + '\' \u65F6\u95F4\u5DF2\u5230</span>\n                                 <button type="button">\u77E5\u9053\u4E86</button>\n                             </div>'));
        $('.notice button').click(function () {
            $(this).parent().remove();
        });
    }
});