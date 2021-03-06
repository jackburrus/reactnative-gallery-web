import React, { Component } from 'react'
import styled from 'styled-components'
import { Grid, Cell } from 'styled-css-grid'
import UploadIcon from 'react-feather/dist/icons/upload'
import Film from 'react-feather/dist/icons/film'
import FolderPlus from 'react-feather/dist/icons/folder-plus'
import { Circle } from 'rc-progress'
import { renderIcon, Next } from '../components/Icon'

import { isFocus } from '../utils'
import VerticalyCentered from '../components/VerticalyCentered'
import { NumberItem, NumberList } from '../components/NumberList'
import Subtitle from '../components/Subtitle'
import { Sizer } from '../components/Gif'
import Smartphone from '../components/Gif/Smartphone'
import GifContainer from '../components/Gif/GifContainer'
import defaultPage from '../hocs/defaultPage'
import {
  requestGifKeyAsync,
  uploadAsync,
  getStatusAsync,
  createGifAsync
} from '../utils/api'

const Label = styled.label`
  cursor: pointer;
  background-color: #00a651;
  color: #fff;
  padding: 10px;
  opacity: 0.85;
  &:hover {
    background-color: #00a65f;
    background-color: ${isFocus('transparent')};
  }
  background-color: ${isFocus('transparent')};
  color: ${isFocus('#333')};
  padding-left: ${isFocus('0px')};
`

const Img = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`

const Empty = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`

const Placeholder = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: #777;
  background-color: #fff;
`

const Status = styled.p`
  color: #333;
  text-align: center;
  font-size: 14px;
`

const Video = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`

class Upload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: undefined,
      isGif: true,
      isVideo: false,
      preview: false,
      percentCompleted: 0,
      status: { task: 'uploading' }
    }
  }

  handleChange = (e) => {
    const file = e.target.files[0]
    const isGif = file.type === 'image/gif'
    this.setState({
      file,
      isGif,
      isVideo: !isGif,
      preview: false
    })
  }
  upload = async () => {
    const id = await requestGifKeyAsync()
    await uploadAsync(id, this.state.file, (progressEvent) => {
      const loaded = progressEvent.loaded * 100
      const percentCompleted = Math.floor(loaded / progressEvent.total)
      this.setState({
        percentCompleted:
          this.state.percentCompleted > percentCompleted
            ? this.state.percentCompleted
            : percentCompleted
      })
    })

    await createGifAsync(id)

    const intervalID = setInterval(async () => {
      const status = await getStatusAsync(id)
      const progress = Number(status.progress || 0.01) * 100
      this.setState({
        status,
        percentCompleted: progress > 100 ? 100 : progress
      })
      if (
        !status ||
        (status.task && status.task === 'complete') ||
        status.task === 'error'
      ) {
        if (status.task === 'complete') {
          window.location.href = '/'
        }
        clearInterval(intervalID)
      }
    }, 7000)
  }

  render() {
    const {
      file,
      isGif,
      isVideo,
      preview,
      percentCompleted,
      status
    } = this.state
    return (
      <VerticalyCentered>
        <Subtitle>Upload Video & Gif</Subtitle>
        <Grid
          style={{
            zIndex: 100,
            position: 'relative',
            flexDirection: 'column',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 55
          }}
        >
          <Cell
            width={8}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1
            }}
          >
            {!file && (
              <Smartphone
                onClick={() => this.inputFile && this.inputFile.click()}
                cursorPointer
              >
                <GifContainer>
                  <Sizer />
                  <Empty>
                    <Placeholder>
                      <Film size={77} />
                    </Placeholder>
                  </Empty>
                </GifContainer>
              </Smartphone>
            )}
            {file &&
              percentCompleted === 0 && (
                <Smartphone>
                  <GifContainer>
                    <Sizer />
                    {isGif && <Img src={window.URL.createObjectURL(file)} />}
                    {isVideo && (
                      <Video autoPlay loop playsInline muted>
                        <source src={window.URL.createObjectURL(file)} />
                      </Video>
                    )}
                  </GifContainer>
                </Smartphone>
              )}

            {percentCompleted > 0 && (
              <Smartphone
                cursorPointer
                onClick={() => this.inputFile && this.inputFile.click()}
              >
                <GifContainer>
                  <Sizer />
                  <Empty>
                    <Placeholder>
                      <div style={{ width: 100, alignSelf: 'center' }}>
                        <Circle
                          percent={percentCompleted}
                          strokeWidth={7}
                          strokeColor="#00a651"
                          strokeLinecap="square"
                          trailColor="#ccc"
                        />
                      </div>
                      {status && (
                        <Status>
                          {status.task === 'NotFoundo'
                            ? 'preparing encoding'
                            : status.task}
                          {percentCompleted}%
                        </Status>
                      )}
                    </Placeholder>
                  </Empty>
                </GifContainer>
              </Smartphone>
            )}
          </Cell>
          <Cell
            width={4}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 33,
              minWidth: 250,
              flexGrow: 1,
              flexShrink: 0
            }}
          >
            <NumberList>
              <NumberItem focus={!file}>
                <form>
                  <Label focus={!!file} htmlFor="file">
                    {renderIcon(FolderPlus)} select it
                  </Label>
                  <input
                    style={{ display: 'none' }}
                    ref={(ref) => {
                      this.inputFile = ref
                      return undefined
                    }}
                    id="file"
                    type="file"
                    accept=".gif, .mp4, .mov"
                    onChange={this.handleChange}
                  />
                </form>
              </NumberItem>
              <Next />
              <NumberItem focus={!!file && !preview} onClick={this.upload}>
                {renderIcon(UploadIcon)} upload it
              </NumberItem>
            </NumberList>
          </Cell>
        </Grid>
      </VerticalyCentered>
    )
  }
}

Upload.defaultProps = {}

Upload.getInitialProps = () => ({})

export default defaultPage(Upload)
