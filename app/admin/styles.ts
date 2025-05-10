export const adminStyles = {
  container: "bg-[#f8f5f0] min-h-screen",
  sidebar: "bg-[#1a5d1a] text-white border-r border-[#009b3a]",
  sidebarHeader: "bg-[#154a15] p-4 border-b border-[#009b3a]",
  sidebarLink: "flex items-center space-x-3 px-4 py-3 hover:bg-[#009b3a] rounded-md transition-all duration-200 group",
  sidebarIcon: "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
  sidebarActive: "bg-[#009b3a]",
  sidebarActiveIcon: "text-white",
  sidebarActiveText: "text-white",
  mainContent: "bg-[#f8f5f0] p-8",
  card: "bg-white shadow-lg rounded-lg overflow-hidden",
  cardHeader: "bg-[#e9b824] text-[#1a5d1a] p-4",
  cardBody: "p-6",
  button: {
    primary: "bg-[#e9b824] text-[#1a5d1a] hover:bg-[#fed100] px-4 py-2 rounded-md transition-colors duration-200",
    secondary: "bg-[#1a5d1a] text-white hover:bg-[#009b3a] px-4 py-2 rounded-md transition-colors duration-200",
    outline: "border-2 border-[#1a5d1a] text-[#1a5d1a] hover:bg-[#1a5d1a] hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
  },
  table: {
    container: "w-full",
    header: "bg-[#e9b824] text-[#1a5d1a]",
    row: "hover:bg-[#f8ede3]",
    cell: "p-4 border-b border-[#e9b824]"
  },
  form: {
    label: "block text-[#1a5d1a] font-semibold mb-1",
    input: "w-full px-3 py-2 border border-[#e9b824] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]",
    textarea: "w-full px-3 py-2 border border-[#e9b824] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
  }
}
