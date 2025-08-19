import { defineStore } from 'pinia'

interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: Date
  views: number
  attachedFiles?: {
    name: string
    type: string
    size: number
    content?: string
    base64?: string
  }[]
}

interface BoardState {
  posts: Post[]
}

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({
    posts: []
  }),

  actions: {
    // 파일들을 게시판에 자동 게시
    async shareFilesToBoard(files: any[]) {
      try {
        const currentUser = '현재사용자' // 실제로는 auth store에서 가져와야 함
        
        // 파일들을 정리해서 제목과 내용 생성
        const fileNames = files.map(f => f.name).join(', ')
        const title = files.length === 1 
          ? `파일 공유: ${files[0].name}`
          : `파일 공유: ${files.length}개 파일`
        
        let content = `채팅에서 공유된 파일들입니다.\n\n`
        content += `파일 목록:\n`
        files.forEach((file, index) => {
          content += `${index + 1}. ${file.name} (${this.formatFileSize(file.size)})\n`
        })
        
        // 첨부파일 정보 생성
        const attachedFiles = files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          content: file.content,
          base64: file.base64
        }))

        const post: Post = {
          id: Date.now(),
          title,
          content,
          author: currentUser,
          createdAt: new Date(),
          views: 0,
          attachedFiles
        }

        this.posts.unshift(post)
        return post
      } catch (error) {
        console.error('게시판 공유 실패:', error)
        throw error
      }
    },

    // 개별 파일을 게시판에 공유
    async shareFileToBoard(file: any) {
      return this.shareFilesToBoard([file])
    },

    // 파일 크기 포맷팅
    formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
})