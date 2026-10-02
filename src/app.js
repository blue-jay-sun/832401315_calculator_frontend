'use strict';
const input = document.querySelector('#expression');
const message = document.querySelector('#message');
let page = 1;
let total = 0;
let busy = false;
let historyRequest = 0;

async function request(path, options = {}) {
  const response = await fetch(window.CALCULATOR_API + path, {
    ...options,
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || '服务请求失败');
  return data;
}

function showError(error) {
  message.textContent = error instanceof TypeError || error.name === 'TimeoutError'
    ? '无法连接后端服务，请检查服务是否启动及接口地址。' : error.message;
}

async function loadHistory() {
  const requestId = ++historyRequest;
  try {
    const query = document.querySelector('#search').value;
    const data = await request(`/api/history?page=${page}&q=${encodeURIComponent(query)}`);
    if (requestId !== historyRequest) return;
    total = data.total;
    if (page > 1 && data.items.length === 0) {
      page = Math.max(1, Math.ceil(total / 10));
      return loadHistory();
    }
    const container = document.querySelector('#history');
    container.replaceChildren();
    if (!data.items.length) container.textContent = '暂无记录，开始你的第一次计算吧。';
    for (const item of data.items) {
      const row = document.createElement('article');
      const expression = document.createElement('button');
      expression.className = 'reuse';
      expression.textContent = item.expression;
      expression.title = '点击复用表达式';
      expression.onclick = () => { input.value = item.expression; input.focus(); };
      const result = document.createElement('strong');
      result.textContent = `= ${item.result}`;
      const time = document.createElement('small');
      time.textContent = new Date(item.created_at).toLocaleString('zh-CN');
      const remove = document.createElement('button');
      remove.textContent = '删除';
      remove.setAttribute('aria-label', `删除记录 ${item.expression}`);
      remove.onclick = async () => {
        remove.disabled = true;
        try {
          await request(`/api/history/${item.id}`, { method: 'DELETE' });
          await loadHistory();
        } catch (error) { showError(error); remove.disabled = false; }
      };
      row.append(expression, result, time, remove);
      container.append(row);
    }
    document.querySelector('#page').textContent = `${page} / ${Math.max(1, Math.ceil(total / 10))}`;
    document.querySelector('#prev').disabled = page <= 1;
    document.querySelector('#next').disabled = page * 10 >= total;
  } catch (error) { if (requestId === historyRequest) showError(error); }
}

document.querySelector('#form').onsubmit = async (event) => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  document.querySelector('.submit').disabled = true;
  message.textContent = '正在计算…';
  document.querySelector('#result').textContent = '—';
  try {
    const data = await request('/api/calculate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: input.value }),
    });
    document.querySelector('#result').textContent = data.result;
    message.textContent = '计算完成，记录已保存。';
    page = 1;
    await loadHistory();
  } catch (error) { showError(error); }
  finally { busy = false; document.querySelector('.submit').disabled = false; }
};

for (const key of ['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '+', '±']) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = key;
  button.onclick = () => {
    if (key === 'C') { input.value = ''; document.querySelector('#result').textContent = '—'; message.textContent = ''; }
    else if (key === '⌫') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
    } else if (key === '±') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== end) {
        const selected = input.value.slice(start, end);
        input.setRangeText(`-(${selected})`, start, end, 'end');
      } else if (input.value) {
        input.value = input.value.startsWith('-(') && input.value.endsWith(')')
          ? input.value.slice(2, -1) : `-(${input.value})`;
      } else input.value = '-';
    } else input.setRangeText(key, input.selectionStart, input.selectionEnd, 'end');
    input.focus();
  };
  document.querySelector('#keys').append(button);
}
input.onkeydown = (event) => { if (event.key === 'Escape') { input.value = ''; message.textContent = ''; document.querySelector('#result').textContent = '—'; } };
document.querySelector('#refresh').onclick = loadHistory;
document.querySelector('#search').onkeydown = (event) => { if (event.key === 'Enter') { page = 1; loadHistory(); } };
document.querySelector('#prev').onclick = () => { if (page > 1) { page--; loadHistory(); } };
document.querySelector('#next').onclick = () => { if (page * 10 < total) { page++; loadHistory(); } };
document.querySelector('#theme').onclick = () => document.body.classList.toggle('dark');
loadHistory();
