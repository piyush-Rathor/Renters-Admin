import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Collapse,
  makeStyles,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { Button, SectionHeader } from '../index'
import { mdiChevronDown, mdiChevronUp, mdiPencil } from '@mdi/js'
import { FormDialog } from '../Form'

const useStyle = makeStyles(theme => ({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },

  headerCell: {
    padding: theme.spacing(1),
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
  },
  actionCell: {
    padding: 0,
    paddingLeft: 4,
    paddingRight: 4,
  },
  footerCell: {
    padding: theme.spacing(1),
  },
}))

const CollapsibleRow = ({ columns, row, updateRowForm, updateRowHandler, statusChangeHandler, allowEdit, collapsibleCellRenderer }) => {
  const classes = useStyle()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <TableRow className={classes.root}>
        {collapsibleCellRenderer && (
          <TableCell>
            <Button icon={open ? mdiChevronUp : mdiChevronDown} size="small" onClick={() => setOpen(!open)} />
          </TableCell>
        )}

        {columns.map(c => (
          <TableCell key={c.field} {...c.props}>
            {c.formatter ? c.formatter(row[c.field]) : row[c.field]}
          </TableCell>
        ))}

        {allowEdit && (
          <TableCell classes={{ root: classes.actionCell }} align="right">
            <Box display="flex" alignItems="center">
              <FormDialog
                title="Edit"
                buttonProps={{ icon: mdiPencil }}
                formProps={{ formConfig: updateRowForm, submitHandler: v => updateRowHandler(row._id, v), incomingValue: row }}
              />
              <Button
                size="small"
                variant="outlined"
                color={row.status === 'ACTIVE' ? 'error' : 'primary'}
                onClick={() =>
                  statusChangeHandler(row._id, { status: { PENDING: 'ACTIVE', ACTIVE: 'BLOCKED', BLOCKED: 'ACTIVE' }[row.status] })
                }>
                {row.status === 'PENDING' && 'Approve'}
                {row.status === 'ACTIVE' && 'Block'}
                {row.status === 'BLOCKED' && 'Unblock'}
              </Button>
            </Box>
          </TableCell>
        )}
      </TableRow>

      {collapsibleCellRenderer && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 2}>
            <Collapse in={open} timeout="auto">
              <Box margin={1}>{collapsibleCellRenderer(row)}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
CollapsibleRow.propTypes = {
  columns: PropTypes.array.isRequired,
  row: PropTypes.object.isRequired,
}

export const Table = props => {
  const { columns, rows, formProps, updateRowForm, updateRowHandler } = props
  const { statusChangeHandler, allowAdd, allowEdit, collapsibleCellRenderer } = props
  const classes = useStyle()

  return (
    <TableContainer component={Paper}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {collapsibleCellRenderer && <TableCell classes={{ root: classes.headerCell }} width={62} />}
            {columns.map(c => (
              <TableCell key={c.field} classes={{ root: classes.headerCell }} {...c.props}>
                {c.label}
              </TableCell>
            ))}
            {allowEdit && <TableCell classes={{ root: classes.headerCell }} width={76} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? (
            rows.map(row => (
              <CollapsibleRow
                key={row._id + '-row'}
                {...{ columns, row, updateRowForm, updateRowHandler, statusChangeHandler, allowEdit, collapsibleCellRenderer }}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1}>No data</TableCell>
            </TableRow>
          )}
          {allowAdd && (
            <TableRow>
              <TableCell classes={{ root: classes.footerCell }} colSpan={columns.length + 1} align="right">
                {true && <FormDialog title="Add Row" formProps={formProps} />}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      props: PropTypes.object,
      formatter: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object),
  allowAdd: PropTypes.bool,
  formProps: PropTypes.object,
  updateRowHandler: PropTypes.func.isRequired,
  statusChangeHandler: PropTypes.func.isRequired,
  allowEdit: PropTypes.bool,
  collapsibleCellRenderer: PropTypes.func,
}

export const TableSection = ({ icon, label, ...props }) => {
  return (
    <>
      <SectionHeader {...{ icon, label }} />

      <Table {...props} />
    </>
  )
}
TableSection.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  ...Table.propTypes,
}
