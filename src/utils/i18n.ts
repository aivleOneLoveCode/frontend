// 간단한 국제화 시스템
interface Translations {
  [key: string]: {
    [language: string]: string
  }
}

export const translations: Translations = {
  // 설정 관련
  'settings': {
    'ko': '설정',
    'en': 'Settings',
    'ja': '設定'
  },
  'help': {
    'ko': '도움말',
    'en': 'Help',
    'ja': 'ヘルプ'
  },
  'logout': {
    'ko': '로그아웃',
    'en': 'Logout',
    'ja': 'ログアウト'
  },
  'user_profile': {
    'ko': '사용자 프로필',
    'en': 'User Profile',
    'ja': 'ユーザープロフィール'
  },
  'appearance': {
    'ko': '외관',
    'en': 'Appearance',
    'ja': '外観'
  },
  'theme': {
    'ko': '테마',
    'en': 'Theme',
    'ja': 'テーマ'
  },
  'language': {
    'ko': '언어',
    'en': 'Language',
    'ja': '言語'
  },
  'light_mode': {
    'ko': '라이트 모드',
    'en': 'Light Mode',
    'ja': 'ライトモード'
  },
  'dark_mode': {
    'ko': '다크 모드',
    'en': 'Dark Mode',
    'ja': 'ダークモード'
  },
  'system_setting': {
    'ko': '시스템 설정',
    'en': 'System Setting',
    'ja': 'システム設定'
  },
  'chat': {
    'ko': '채팅',
    'en': 'Chat',
    'ja': 'チャット'
  },
  'auto_save_chat': {
    'ko': '채팅 기록 자동 저장',
    'en': 'Auto Save Chat History',
    'ja': 'チャット履歴自動保存'
  },
  'auto_scroll': {
    'ko': '자동 스크롤',
    'en': 'Auto Scroll',
    'ja': '自動スクロール'
  },
  'message_font_size': {
    'ko': '메시지 글꼴 크기',
    'en': 'Message Font Size',
    'ja': 'メッセージフォントサイズ'
  },
  'small': {
    'ko': '작게',
    'en': 'Small',
    'ja': '小'
  },
  'medium': {
    'ko': '보통',
    'en': 'Medium',
    'ja': '中'
  },
  'large': {
    'ko': '크게',
    'en': 'Large',
    'ja': '大'
  },
  'workflow': {
    'ko': '워크플로우',
    'en': 'Workflow',
    'ja': 'ワークフロー'
  },
  'auto_execute_workflow': {
    'ko': '워크플로우 자동 실행',
    'en': 'Auto Execute Workflow',
    'ja': 'ワークフロー自動実行'
  },
  'execution_complete_notification': {
    'ko': '실행 완료 알림',
    'en': 'Execution Complete Notification',
    'ja': '実行完了通知'
  },
  'items_per_page': {
    'ko': '페이지당 표시 항목 수',
    'en': 'Items Per Page',
    'ja': 'ページ毎表示項目数'
  },
  'notification': {
    'ko': '알림',
    'en': 'Notification',
    'ja': '通知'
  },
  'desktop_notification': {
    'ko': '데스크톱 알림',
    'en': 'Desktop Notification',
    'ja': 'デスクトップ通知'
  },
  'sound_notification': {
    'ko': '소리 알림',
    'en': 'Sound Notification',
    'ja': '音声通知'
  },
  'cancel': {
    'ko': '취소',
    'en': 'Cancel',
    'ja': 'キャンセル'
  },
  'save': {
    'ko': '저장',
    'en': 'Save',
    'ja': '保存'
  },
  'confirm': {
    'ko': '확인',
    'en': 'Confirm',
    'ja': '確認'
  },
  // 알림 메시지
  'theme_changed_light': {
    'ko': '테마가 라이트 모드로 변경되었습니다.',
    'en': 'Theme changed to Light Mode.',
    'ja': 'テーマをライトモードに変更しました。'
  },
  'theme_changed_dark': {
    'ko': '테마가 다크 모드로 변경되었습니다.',
    'en': 'Theme changed to Dark Mode.',
    'ja': 'テーマをダークモードに変更しました。'
  },
  'theme_changed_system': {
    'ko': '테마가 시스템 설정으로 변경되었습니다.',
    'en': 'Theme changed to System Setting.',
    'ja': 'テーマをシステム設定に変更しました。'
  },
  'font_size_changed_small': {
    'ko': '글꼴 크기가 작게로 변경되었습니다.',
    'en': 'Font size changed to Small.',
    'ja': 'フォントサイズを小に変更しました。'
  },
  'font_size_changed_medium': {
    'ko': '글꼴 크기가 보통로 변경되었습니다.',
    'en': 'Font size changed to Medium.',
    'ja': 'フォントサイズを中に変更しました。'
  },
  'font_size_changed_large': {
    'ko': '글꼴 크기가 크게로 변경되었습니다.',
    'en': 'Font size changed to Large.',
    'ja': 'フォントサイズを大に変更しました。'
  },
  'items_per_page_changed': {
    'ko': '페이지당 표시 항목 수가 {count}개로 변경되었습니다.',
    'en': 'Items per page changed to {count}.',
    'ja': 'ページ毎表示項目数を{count}個に変更しました。'
  },
  'desktop_notification_enabled': {
    'ko': '데스크톱 알림이 활성화되었습니다.',
    'en': 'Desktop notification enabled.',
    'ja': 'デスクトップ通知を有効にしました。'
  },
  'desktop_notification_disabled': {
    'ko': '데스크톱 알림이 비활성화되었습니다.',
    'en': 'Desktop notification disabled.',
    'ja': 'デスクトップ通知を無効にしました。'
  },
  'language_changed': {
    'ko': '언어가 변경되었습니다.',
    'en': 'Language changed.',
    'ja': '言語を変更しました。'
  },
  // 사이드바 관련
  'new_chat': {
    'ko': '새 채팅',
    'en': 'New Chat',
    'ja': '新しいチャット'
  },
  'new_folder': {
    'ko': '새 폴더',
    'en': 'New Folder',
    'ja': '新しいフォルダー'
  },
  'folders': {
    'ko': '폴더',
    'en': 'Folders',
    'ja': 'フォルダー'
  },
  'workflows': {
    'ko': '워크플로우',
    'en': 'Workflows',
    'ja': 'ワークフロー'
  },
  'chat_history': {
    'ko': '채팅 기록',
    'en': 'Chat History',
    'ja': 'チャット履歴'
  },
  'user': {
    'ko': '사용자',
    'en': 'User',
    'ja': 'ユーザー'
  },
  // 드롭다운 메뉴
  'rename': {
    'ko': '이름 변경',
    'en': 'Rename',
    'ja': '名前変更'
  },
  'delete': {
    'ko': '삭제',
    'en': 'Delete',
    'ja': '削除'
  },
  'copy': {
    'ko': '복사',
    'en': 'Copy',
    'ja': 'コピー'
  },
  'paste': {
    'ko': '붙여넣기',
    'en': 'Paste',
    'ja': '貼り付け'
  },
  // 헤더 관련
  'connected': {
    'ko': '연결됨',
    'en': 'Connected',
    'ja': '接続済み'
  },
  'disconnected': {
    'ko': '연결 끊김',
    'en': 'Disconnected',
    'ja': '切断'
  },
  'retry_connection': {
    'ko': '다시 연결',
    'en': 'Retry Connection',
    'ja': '再接続'
  },
  'download_workflow_json': {
    'ko': '워크플로우 JSON 다운로드',
    'en': 'Download Workflow JSON',
    'ja': 'ワークフローJSON ダウンロード'
  },
  'go_to_board': {
    'ko': '게시판으로 이동',
    'en': 'Go to Board',
    'ja': '掲示板に移動'
  },
  'login_signup': {
    'ko': '로그인/회원가입',
    'en': 'Login/Sign Up',
    'ja': 'ログイン/新規登録'
  },
  // 채팅 관련
  'welcome_title': {
    'ko': 'DA-ZZANY',
    'en': 'DA-ZZANY',
    'ja': 'DA-ZZANY'
  },
  'welcome_subtitle': {
    'ko': '무엇을 도와드릴까요?',
    'en': 'How can I help you today?',
    'ja': '何かお手伝いしましょうか？'
  },
  'enter_message': {
    'ko': '메시지를 입력하세요...',
    'en': 'Enter your message...',
    'ja': 'メッセージを入力してください...'
  },
  'send_message': {
    'ko': '메시지 전송',
    'en': 'Send Message',
    'ja': 'メッセージ送信'
  },
  'file_upload': {
    'ko': '파일 업로드',
    'en': 'File Upload',
    'ja': 'ファイルアップロード'
  },
  'drop_files_here': {
    'ko': '파일을 여기에 드롭하세요',
    'en': 'Drop files here',
    'ja': 'ファイルをここにドロップしてください'
  },
  'remove_file': {
    'ko': '파일 제거',
    'en': 'Remove file',
    'ja': 'ファイルを削除'
  },
  'disclaimer': {
    'ko': 'DA-ZZANY는 실수할 수 있습니다. 중요한 정보를 확인해 보세요.',
    'en': 'DA-ZZANY can make mistakes. Please verify important information.',
    'ja': 'DA-ZZANYは間違いを犯す可能性があります。重要な情報は確認してください。'
  },
  // 도움말 모달
  'help_getting_started': {
    'ko': '시작하기',
    'en': 'Getting Started',
    'ja': '始め方'
  },
  'help_getting_started_content': {
    'ko': 'DA-ZZANY 워크플로우 관리자에 오신 것을 환영합니다! 이 도구를 사용하여 AI 채팅과 자동화 워크플로우를 효율적으로 관리할 수 있습니다.',
    'en': 'Welcome to DA-ZZANY Workflow Manager! You can efficiently manage AI chat and automation workflows using this tool.',
    'ja': 'DA-ZZANY ワークフローマネージャーへようこそ！このツールを使用して、AIチャットと自動化ワークフローを効率的に管理できます。'
  },
  'help_chat_usage': {
    'ko': '채팅 사용법',
    'en': 'Chat Usage',
    'ja': 'チャットの使用方法'
  },
  'help_chat_usage_content': {
    'ko': '화면 하단의 입력창에 메시지를 입력하고 Enter 키를 누르세요|좌측 사이드바에서 채팅 기록을 확인할 수 있습니다|새 채팅을 시작하려면 "새 채팅" 버튼을 클릭하거나 Ctrl+Shift+O를 누르세요|파일을 첨부하려면 입력창 좌측의 클립 버튼을 클릭하세요',
    'en': 'Enter your message in the input field at the bottom of the screen and press Enter|You can check chat history in the left sidebar|Click the "New Chat" button or press Ctrl+Shift+O to start a new chat|Click the clip button on the left side of the input field to attach files',
    'ja': '画面下部の入力欄にメッセージを入力してEnterキーを押してください|左サイドバーでチャット履歴を確認できます|新しいチャットを開始するには「新しいチャット」ボタンをクリックするかCtrl+Shift+Oを押してください|ファイルを添付するには入力欄左側のクリップボタンをクリックしてください'
  },
  'help_folder_management': {
    'ko': '폴더 관리',
    'en': 'Folder Management',
    'ja': 'フォルダ管理'
  },
  'help_folder_management_content': {
    'ko': '"새 폴더" 버튼을 클릭하거나 Ctrl+Shift+F로 새 폴더를 생성하세요|폴더를 클릭하면 해당 폴더의 워크플로우를 볼 수 있습니다|폴더명 옆의 ⋯ 메뉴에서 이름 변경이나 삭제가 가능합니다|페이지네이션을 통해 여러 폴더를 탐색할 수 있습니다',
    'en': 'Click the "New Folder" button or press Ctrl+Shift+F to create a new folder|Click a folder to view its workflows|You can rename or delete folders using the ⋯ menu next to the folder name|Navigate through multiple folders using pagination',
    'ja': '「新しいフォルダー」ボタンをクリックするか、Ctrl+Shift+Fで新しいフォルダーを作成してください|フォルダーをクリックすると、そのフォルダーのワークフローを表示できます|フォルダー名の横の⋯メニューから名前変更や削除が可能です|ページネーションを使用して複数のフォルダーを探索できます'
  },
  'help_workflow_management': {
    'ko': '워크플로우 관리',
    'en': 'Workflow Management',
    'ja': 'ワークフロー管理'
  },
  'help_workflow_management_content': {
    'ko': '메인 화면의 워크플로우 예시를 클릭하여 빠르게 추가할 수 있습니다|워크플로우 좌측의 빨간 점을 클릭하여 활성화/비활성화를 설정하세요|활성화된 워크플로우는 자동으로 트리거 조건에 따라 실행됩니다|워크플로우를 클릭하면 우측 패널에서 상세 정보를 볼 수 있습니다|JSON 파일을 드래그 앤 드롭하여 새로운 워크플로우를 추가할 수 있습니다',
    'en': 'Click workflow examples on the main screen to quickly add them|Click the red dot on the left side of workflows to activate/deactivate them|Active workflows automatically execute based on trigger conditions|Click a workflow to view detailed information in the right panel|Drag and drop JSON files to add new workflows',
    'ja': 'メイン画面のワークフロー例をクリックして素早く追加できます|ワークフロー左側の赤い点をクリックしてアクティブ化/非アクティブ化を設定してください|アクティブなワークフローはトリガー条件に基づいて自動的に実行されます|ワークフローをクリックすると右パネルで詳細情報を表示できます|JSONファイルをドラッグアンドドロップして新しいワークフローを追加できます'
  },
  'help_shortcuts': {
    'ko': '단축키',
    'en': 'Shortcuts',
    'ja': 'ショートカット'
  },
  'help_shortcuts_content': {
    'ko': 'Ctrl+Shift+O: 새 채팅 시작|Ctrl+Shift+F: 새 폴더 생성|Enter: 메시지 전송|Shift+Enter: 줄바꿈|Ctrl+/: 사이드바 토글',
    'en': 'Ctrl+Shift+O: Start new chat|Ctrl+Shift+F: Create new folder|Enter: Send message|Shift+Enter: Line break|Ctrl+/: Toggle sidebar',
    'ja': 'Ctrl+Shift+O: 新しいチャット開始|Ctrl+Shift+F: 新しいフォルダー作成|Enter: メッセージ送信|Shift+Enter: 改行|Ctrl+/: サイドバートグル'
  },
  'help_troubleshooting': {
    'ko': '문제 해결',
    'en': 'Troubleshooting',
    'ja': 'トラブルシューティング'
  },
  'help_troubleshooting_content': {
    'ko': '채팅이 응답하지 않으면 새 채팅을 시작해보세요|워크플로우가 실행되지 않으면 활성화 상태를 확인하세요|페이지가 느려지면 브라우저 캐시를 삭제해보세요|설정에서 알림 권한을 허용하면 더 나은 경험을 할 수 있습니다',
    'en': 'If chat is not responding, try starting a new chat|If workflows are not executing, check their activation status|If the page is slow, try clearing your browser cache|Allow notification permissions in settings for a better experience',
    'ja': 'チャットが応答しない場合は、新しいチャットを開始してみてください|ワークフローが実行されない場合は、アクティブ状態を確認してください|ページが遅い場合は、ブラウザーキャッシュを削除してみてください|設定で通知権限を許可すると、より良い体験ができます'
  },
  // 사이드바 추가 키
  'close_sidebar': {
    'ko': '사이드바 닫기',
    'en': 'Close Sidebar',
    'ja': 'サイドバーを閉じる'
  },
  'activate_workflow': {
    'ko': '워크플로우 활성화 (트리거 대기)',
    'en': 'Activate Workflow (Waiting for Trigger)',
    'ja': 'ワークフローをアクティブ化 (トリガー待機)'
  },
  'deactivate_workflow': {
    'ko': '워크플로우 비활성화',
    'en': 'Deactivate Workflow',
    'ja': 'ワークフローを非アクティブ化'
  },
  'enter_new_name': {
    'ko': '새로운 이름을 입력하세요:',
    'en': 'Enter new name:',
    'ja': '新しい名前を入力してください:'
  },
  'confirm_delete': {
    'ko': '정말로 삭제하시겠습니까?',
    'en': 'Are you sure you want to delete this?',
    'ja': '本当に削除しますか？'
  },
  'confirm_logout': {
    'ko': '정말로 로그아웃하시겠습니까?',
    'en': 'Are you sure you want to logout?',
    'ja': '本当にログアウトしますか？'
  },
  'copy_suffix': {
    'ko': '복사본',
    'en': 'Copy',
    'ja': 'コピー'
  }
}

import { ref } from 'vue'

// 반응형 언어 상태
export const currentLanguage = ref('ko')

export function setLanguage(language: string) {
  currentLanguage.value = language
}

export function getCurrentLanguage() {
  return currentLanguage.value
}

// 반응형 번역 함수
export function t(key: string, params?: { [key: string]: string | number }): string {
  const translation = translations[key]?.[currentLanguage.value] || translations[key]?.['ko'] || key
  
  if (params) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match
    })
  }
  
  return translation
}

// 반응형 번역 훅 (컴포넌트에서 사용)
export function useTranslation() {
  return {
    t: (key: string, params?: { [key: string]: string | number }) => t(key, params),
    tList: (key: string) => t(key).split('|'),
    currentLanguage,
    setLanguage
  }
}