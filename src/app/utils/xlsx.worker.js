/* global self */
/* eslint-disable no-restricted-globals */
import xlsx from 'xlsx';

self.onmessage = function handle(event) {
  const reader = new FileReader();

  reader.onload = e => {
    const data = e.target.result;

    const v = xlsx.read(
      data,
      Object.assign({ type: 'binary' }, event.data.opts),
    );
    self.postMessage(v);
  };

  reader.readAsBinaryString(event.data.file);
};
