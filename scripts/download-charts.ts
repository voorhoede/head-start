import type { Data } from '../src/blocks/ChartBlock';
import { mkdir, writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

const distDir = './public/charts/';

async function downloadCharts() {
  // use client instead of http api for pagination support
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });

  await mkdir(distDir, { recursive: true });
    
  for await (const chartBlock of client.items.listPagedIterator({ filter: { type: 'chart_block' } })) {
    const { columns, data: rows, } = (() => {
      try {
        return JSON.parse(chartBlock.data as string) as Data;
      } catch {
        console.warn('Invalid chart data for chart block', chartBlock.id);
        return { columns: [], data: [] };
      }
    })();

    if (!columns.length || !rows.length) {
      continue;
    }

    const csvText = [
      columns.join(','),
      ...rows.map(row => Object.values(row).join(',')),
    ].join('\n');

    await writeFile(`${distDir}${chartBlock.id}.csv`, csvText);
  }
}

downloadCharts()
  .then(() => console.log('Charts downloaded'));
