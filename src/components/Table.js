import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  makeStyles,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { Button, SectionHeader } from './index'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { FormDialog } from './Form'

const useStyle = makeStyles(theme => ({
  headerCell: {
    padding: theme.spacing(1),
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
  },
  actionCell: {
    padding: 0,
    paddingLeft: 4,
  },
  footerCell: {
    padding: theme.spacing(1),
  },
}))

export const Table = ({ containerProps, columns, rows, getKey, ...props }) => {
  const { formProps, updateRowForm, updateRowHandler, deleteRowHandler } = props
  const { allowEdit, allowAdd, renderActionButtons, hideHeader, ...tableProps } = props
  const classes = useStyle()

  const showEditColumn = !!((rows.length && rows.some(r => r.allowEdit)) || allowEdit)

  return (
    <TableContainer component={Paper} {...containerProps}>
      <MuiTable {...tableProps}>
        {!hideHeader && (
          <TableHead>
            <TableRow>
              {columns.map(c => (
                <TableCell key={c.field} classes={{ root: classes.headerCell }} {...c.props}>
                  {c.label}
                </TableCell>
              ))}
              {renderActionButtons && <TableCell classes={{ root: classes.headerCell }} />}
              {showEditColumn && <TableCell classes={{ root: classes.headerCell }} width={76} />}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {rows.length ? (
            rows.map((row, idx) => (
              <TableRow key={getKey ? getKey(row) : row[columns[0].field]}>
                {columns.map(c => (
                  <TableCell key={c.field} {...c.props} {...row.props}>
                    {c.formatter ? c.formatter(row[c.field]) : row[c.field]}
                  </TableCell>
                ))}
                {renderActionButtons && (
                  <TableCell classes={{ root: classes.actionCell }} align="right">
                    <Box display="flex">{renderActionButtons(row, idx)}</Box>
                  </TableCell>
                )}
                {showEditColumn && (
                  <TableCell classes={{ root: classes.actionCell }} align="right">
                    {(row.allowEdit || allowEdit) && (
                      <Box display="flex">
                        <FormDialog
                          title="Edit"
                          buttonProps={{ icon: mdiPencil }}
                          formProps={{
                            formConfig: updateRowForm,
                            submitHandler: v => updateRowHandler(v, idx),
                            incomingValue: row,
                          }}
                        />
                        <Button icon={mdiDelete} color="error" onClick={() => deleteRowHandler(row, idx)} />
                      </Box>
                    )}
                  </TableCell>
                )}
              </TableRow>
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
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  formProps: PropTypes.object,
  updateRowHandler: PropTypes.func,
  deleteRowHandler: PropTypes.func,
  allowAdd: PropTypes.bool,
  allowEdit: PropTypes.bool,
  renderActionButtons: PropTypes.func,
}

export const TableSection = ({ icon, label, leftComponent, rightComponent, ...props }) => {
  return (
    <>
      <SectionHeader {...{ icon, label, leftComponent, rightComponent }} />

      <Table {...props} />
    </>
  )
}
TableSection.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  ...Table.propTypes,
}
