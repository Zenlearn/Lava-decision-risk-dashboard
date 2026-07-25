import React from 'react';

// Density type for tables
export type TableDensity = 'compact' | 'comfortable' | 'relaxed';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', density = 'comfortable', ...props }, ref) => (
    <div className="table-container-premium" style={{ width: '100%', overflowX: 'auto' }}>
      <table
        ref={ref}
        className={`table-premium table-density-${density} ${className}`}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <thead ref={ref} className={className} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr ref={ref} className={className} {...props} />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', style, ...props }, ref) => (
    <th
      ref={ref}
      className={className}
      style={{
        paddingTop: 'var(--cell-py, 10px)',
        paddingBottom: 'var(--cell-py, 10px)',
        ...style
      }}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', style, ...props }, ref) => (
    <td
      ref={ref}
      className={className}
      style={{
        paddingTop: 'var(--cell-py, 10px)',
        paddingBottom: 'var(--cell-py, 10px)',
        ...style
      }}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

export const TableSummaryRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr ref={ref} className={`summary-row-premium ${className}`} {...props} />
  )
);
TableSummaryRow.displayName = 'TableSummaryRow';
