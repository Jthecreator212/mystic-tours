import ContentManager from "@/components/admin/ContentManager"
import { adminStyles } from "@/app/admin/styles"

export default function ContentPage() {
  return (
    <div className={adminStyles.container}>
      <h1 className={adminStyles.heading}>Content Management</h1>
      <p className={adminStyles.description}>
        Manage content areas and images across your website.
      </p>
      <ContentManager />
    </div>
  )
}
