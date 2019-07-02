let App = {
    loading: false,
    load: async () => {
        console.log("APp is loading")

        App.contracts = {};

        await App.loadWeb3()
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to metamask");
        }

        if (window.ethereum) {
            window.web3 = new Web3(ethereum);

            try {
                await ethereum.enable()
            } catch (err) {
                console.error(err);
            }
        }

        if (window.web3) {
            App.web3 = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);


        } else {
            console.log("Not eth browser");
        }
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        console.log(App.account);
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);

        App.todoList = await App.contracts.TodoList.deployed();

        console.log(App.contracts);
    },

    render: async () => {
        if (App.loading) {
            return;
        }

        App.setLoading(true);

        $('#account').html(App.account);

        App.setLoading(false);

        await App.renderTasks()
    },

    setLoading: (boolean) => {
        App.loading = boolean;

        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    },

    renderTasks: async () => {
        // Load the tasks from block chain
        const taskCount = await App.todoList.taskCount();

        const $template = $('.taskTemplate');

        for (var i = 1; i <= taskCount; i++) {

            const task = await App.todoList.tasks(i);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];

            const $newTaskEl = $template.clone();

            $newTaskEl.find('.content').html(taskContent);
            $newTaskEl.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleCompleted);

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskEl);
            } else {
                $('#taskList').append($newTaskEl);
            }

            $newTaskEl.show();
        }
    },



    toggleCompleted: (e) => {
        console.log(e);
        let checked = $(e.target).prop('checked');
        $(e.target).prop('checked', !checked);

        console.log($(e.target).prop('checked'));
    }
}

$(() => {
    $(window).load(() => {
        App.load();
    })
})