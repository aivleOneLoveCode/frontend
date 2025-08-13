import { ref, nextTick } from 'vue'
import type { Message, ChatHistoryItem, ExamplePrompt } from '../types'

export function useChatManagement() {
  const messages = ref<Message[]>([])
  const inputText = ref('')
  const showWelcome = ref(true)
  const currentChatId = ref<number | null>(null)

  const chatHistoryItems = ref<ChatHistoryItem[]>([
    { id: 1, title: 'Git pull 동작 설명', active: false, messages: [] },
    { id: 2, title: '프론트엔드 코드 예시', active: false, messages: [] },
    { id: 3, title: 'Git 저장소 올리기', active: false, messages: [] },
    { id: 4, title: 'React 실행 방법', active: false, messages: [] },
    { id: 5, title: 'MCP 서버 추천', active: false, messages: [] },
    { id: 6, title: 'Python 환경변수 편집', active: false, messages: [] },
    { id: 7, title: '이 두 사람 누구인가', active: false, messages: [] },
    { id: 8, title: 'MCP Client 연결 오류', active: false, messages: [] },
  ])

  const sendMessage = () => {
    if (!inputText.value.trim()) return

    const currentInput = inputText.value
    
    if (currentChatId.value === null) {
      const newChatTitle = currentInput.length > 20 ? currentInput.substring(0, 20) + '...' : currentInput
      const newChatId = Date.now()
      
      chatHistoryItems.value.forEach(item => item.active = false)
      
      chatHistoryItems.value.unshift({
        id: newChatId,
        title: newChatTitle,
        active: true,
        messages: []
      })
      
      currentChatId.value = newChatId
    }

    showWelcome.value = false
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: currentInput
    }

    messages.value.push(userMessage)
    
    const currentChat = chatHistoryItems.value.find(item => item.id === currentChatId.value)
    if (currentChat) {
      currentChat.messages.push(userMessage)
    }
    
    inputText.value = ''

    nextTick(() => {
      scrollToBottom()
    })

    setTimeout(() => {
      const workflowResponse = checkForWorkflowInMessage(currentInput)
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: workflowResponse || `안녕하세요! "${currentInput}"에 대해 답변드리겠습니다. 어떤 도움이 필요하신지 자세히 알려주시면 더 구체적으로 도움을 드릴 수 있습니다.`
      }
      messages.value.push(assistantMessage)
      
      if (currentChat) {
        currentChat.messages.push(assistantMessage)
      }
      
      nextTick(() => {
        scrollToBottom()
      })
    }, 1000)
  }

  const newChat = () => {
    messages.value = []
    inputText.value = ''
    showWelcome.value = true
    currentChatId.value = null
    chatHistoryItems.value.forEach(item => item.active = false)
  }

  const selectChatHistory = (selectedItem: ChatHistoryItem) => {
    chatHistoryItems.value.forEach(item => item.active = false)
    selectedItem.active = true
    currentChatId.value = selectedItem.id
    
    showWelcome.value = false
    messages.value = [...selectedItem.messages]
  }

  const useExamplePrompt = (prompt: ExamplePrompt) => {
    inputText.value = prompt.text
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  const checkForWorkflowInMessage = (messageContent: string) => {
    const jsonPatterns = [
      /워크플로우.*생성/i,
      /json.*파일.*만들/i,
      /n8n.*워크플로우/i,
      /자동화.*워크플로우/i
    ]
    
    const containsWorkflowRequest = jsonPatterns.some(pattern => 
      pattern.test(messageContent)
    )
    
    if (containsWorkflowRequest) {
      return `새로운 워크플로우가 생성되었습니다. 워크플로우 목록에서 확인하실 수 있습니다.`
    }
    
    return null
  }

  return {
    messages,
    inputText,
    showWelcome,
    chatHistoryItems,
    currentChatId,
    sendMessage,
    newChat,
    selectChatHistory,
    useExamplePrompt,
    handleKeydown,
    scrollToBottom
  }
}