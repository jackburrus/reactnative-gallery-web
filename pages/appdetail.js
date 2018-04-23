import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Head from 'next/head'
import VerticalyCentered from '../components/VerticalyCentered'
import CommentIcon from '../components/Comment'
import ViewIcon from '../components/ViewIcon'
import Subtitle from '../components/Subtitle'
import Love from '../components/Love'
import Octicon from '../components/Octicon'
import defaultPage from '../hocs/defaultPage'
import { getGifBySlugAsync, getGifInfo } from '../utils/api'
import Gif from '../components/Gif'
import pkg from '../package.json'

const SocialBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-top: 17px;
`

const Author = styled.h5`
  display: block;
  text-align: center;
  color: #fff;
  margin-top: -1em;
  margin-bottom: 1em;
`
const getTitle = (name, username) => `${name} by @${username}`

const AppDetail = ({
  id,
  slug,
  owner,
  comment,
  numberOfView,
  like,
  name,
  shortDescription,
  category,
  username,
  originalUrl,
  githubLink,
  width,
  height
}) => (
  <div>
    <Head>
      <title>{getTitle(name, username)}</title>
      <meta
        name="description"
        content={shortDescription}
        property="description"
      />
      <meta name="keywords" content={category.join(', ')} property="keywords" />
      <meta name="twitter:card" content="app" />
      <meta name="twitter:site" content="@rn_gallery" />
      <meta property="og:type" content="video.other" />
      <meta property="og:title" content={getTitle(name, username)} />
      <meta property="og:url" content={`${pkg.website}${originalUrl}`} />
      <meta property="og:description" content={shortDescription} />
      <meta
        property="og:image"
        content={`https://thumbs.gfycat.com/${id}-max-14mb.gif`}
      />
      <meta property="og:image:type" content="image/gif" />
      <meta property="og:image:width" content={`${width}`} />
      <meta property="og:image:height" content={`${height}`} />
    </Head>
    <VerticalyCentered>
      <Subtitle>{name}</Subtitle>
      <Author>by @{username}</Author>
      <Gif gifId={id} slug={slug} username={owner.id} minWidth={250} autoplay />
      <SocialBar>
        <CommentIcon number={comment.length} />
        <ViewIcon number={numberOfView} />
        <Love number={like} />
        {githubLink && <Octicon number={like} link={githubLink} />}
      </SocialBar>
    </VerticalyCentered>
  </div>
)

AppDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  originalUrl: PropTypes.string.isRequired,
  shortDescription: PropTypes.string,
  numberOfView: PropTypes.number,
  like: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  githubLink: PropTypes.string,
  owner: PropTypes.shape({ id: PropTypes.string }).isRequired,
  comment: PropTypes.arrayOf(PropTypes.object),
  category: PropTypes.arrayOf(PropTypes.string)
}

AppDetail.defaultProps = {
  comment: [],
  category: pkg.keywords,
  numberOfView: 0,
  like: 0,
  shortDescription: pkg.description,
  githubLink: undefined
}

AppDetail.getInitialProps = async ({ req, query }) => {
  const { slug, username } = query
  const gif = await getGifBySlugAsync(req, slug)
  const { width, height } = await getGifInfo(gif.id)
  return {
    ...gif,
    username,
    originalUrl: req.originalUrl,
    width,
    height
  }
}

export default defaultPage(AppDetail)