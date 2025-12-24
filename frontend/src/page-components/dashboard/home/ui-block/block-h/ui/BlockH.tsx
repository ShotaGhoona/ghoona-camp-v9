import { BLOCK_CONFIGS } from '../../../config/block-config';
import type { DashboardBlockProps } from '../../../model/types';

const config = BLOCK_CONFIGS['block-h'];

export function BlockH({ isEditMode }: DashboardBlockProps) {
  return (
    <div className='flex h-full flex-col rounded-lg border bg-card p-4 shadow-sm'>
      <h3 className='mb-2 font-semibold text-card-foreground'>
        {config.label}
      </h3>
      <div className='flex-1 text-sm text-muted-foreground'>
        <p>
          最小: {config.constraints.minW}x{config.constraints.minH}
        </p>
        <p>
          最大: {config.constraints.maxW}x{config.constraints.maxH}
        </p>
      </div>
      {isEditMode && (
        <div className='mt-2 text-xs text-blue-500'>編集モード</div>
      )}
    </div>
  );
}
