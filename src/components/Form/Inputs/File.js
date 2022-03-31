import React, { Component } from 'react'
import { Typography, Card, CardActionArea, Box, Dialog, Grow, CardContent } from '@material-ui/core'
import {
  mdiFileOutline,
  mdiImageOutline,
  mdiFilePdfOutline,
  mdiFileDocumentOutline,
  mdiFileExcelOutline,
  mdiEyeOutline,
  mdiClose,
} from '@mdi/js'
import { Icon, Button } from '../../../components'

class FileInputBox extends Component {
  constructor(props) {
    super(props)
    this.fileUpload = React.createRef()
    this.state = { url: null, showDialog: false }
  }

  componentDidMount() {
    // const { x, width } = document.getElementsByTagName('form')[0].getBoundingClientRect()
    this.formEnd = 0 // x + width + 12
  }

  showFileUpload = () => {
    if (this.fileUpload) this.fileUpload.current.click()
  }

  handleFileChange = e => {
    e.preventDefault()
    let file = e.target.files[0]
    if (file && this.props.onChange) this.props.onChange(file)
  }

  openDialog = () => {
    const { value } = this.props

    if (value instanceof File) {
      let reader = new FileReader()
      reader.onloadend = () => this.setState({ url: reader.result, showDialog: true })
      reader.readAsDataURL(value)
    } else if (typeof value === 'object') this.setState({ url: value.original, showDialog: true })
  }
  closeDialog = () => this.setState({ url: null, showDialog: false })

  render() {
    const { url, showDialog } = this.state
    const { value, error, helperText, disabled } = this.props

    const fileName =
      value &&
      (value instanceof File
        ? value.name
        : decodeURIComponent(value.original.split('#')[0].split('?')[0].split('/').pop()))
    const fileType = value && (value instanceof File ? value.type : fileName.split('.').pop())
    return (
      <>
        <Box display="flex" flexDirection="column">
          <Typography variant="caption" color="textSecondary">
            {this.props.label} {this.props.required && '*'}
          </Typography>

          <Box display="none">
            <input ref={this.fileUpload} type="file" onChange={this.handleFileChange} accept="image/*" />
          </Box>

          <Card style={{ display: 'flex', alignItems: 'center' }}>
            <CardActionArea
              onClick={this.showFileUpload}
              disabled={disabled}
              title={error ? helperText : fileName || 'Select a file'}
              style={{ maxWidth: value && value.original ? 'calc(100% - 36px)' : '100%' }}>
              <CardContent style={{ padding: 8 }}>
                <Box display="flex" alignItems="center">
                  <GetIcon mimeType={fileType} color={error ? 'error' : 'rgb(206 206 206)'} />
                  <Box flexGrow={1} style={{ maxWidth: 'calc(100% - 36px)' }}>
                    {error ? (
                      <Typography variant="subtitle2" color="error" noWrap>
                        {helperText}
                      </Typography>
                    ) : (
                      <Typography variant="subtitle2" color="textSecondary" noWrap>
                        {fileName || 'Select a file'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
            {value && value.original && (
              <Button color="info" size="small" icon={mdiEyeOutline} onClick={this.openDialog} />
            )}
          </Card>
        </Box>
        <Dialog
          onClose={this.closeDialog}
          open={showDialog}
          maxWidth={false}
          TransitionComponent={Grow}
          PaperProps={{
            style: {
              width: '100vw',
              height: '100vh',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginLeft: this.formEnd,
            },
          }}>
          <Box position="absolute" top={-4} right={-6}>
            <Button size="small" icon={mdiClose} style={{ background: 'white' }} onClick={this.closeDialog} />
          </Box>
          {showDialog && (
            <>
              {['pdf', 'PDF'].some(ext => fileType.includes(ext)) ? (
                <iframe
                  src={url}
                  title="File Preview"
                  style={{ height: '100%', width: '100%', border: 'none' }}
                />
              ) : ['png', 'jpg', 'jpeg', 'jfif', 'webp', 'PNG', 'JPG', 'JPEG'].some(ext =>
                  fileType.includes(ext)
                ) ? (
                <img src={url} alt="File Preview" style={{ maxHeight: '100%', maxWidth: '100%' }} />
              ) : (
                <Button component="a" href={url} download>
                  Download
                </Button>
              )}
            </>
          )}
        </Dialog>
      </>
    )
  }
}

const GetIcon = ({ mimeType, color }) => {
  if (mimeType.includes('sheet')) return <Icon path={mdiFileExcelOutline} size={1.5} />
  if (mimeType.includes('document')) return <Icon path={mdiFileDocumentOutline} size={1.5} />
  if (mimeType.includes('pdf')) return <Icon path={mdiFilePdfOutline} size={1.5} />
  if (mimeType.includes('image')) return <Icon path={mdiImageOutline} size={1.5} />
  return <Icon path={mdiFileOutline} size={1.5} color={color} />
}
GetIcon.defaultProps = {
  mimeType: '',
}

export default FileInputBox
