/**
 * Prisma Seed Data
 * Sample data for development
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (development only!)
  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany(),
    prisma.callLog.deleteMany(),
    prisma.downloadLog.deleteMany(),
    prisma.feedbackHistory.deleteMany(),
    prisma.feedbackPhoto.deleteMany(),
    prisma.feedbackSubmission.deleteMany(),
    prisma.documentContactInfo.deleteMany(),
    prisma.documentForm.deleteMany(),
    prisma.documentRequiredDoc.deleteMany(),
    prisma.documentStep.deleteMany(),
    prisma.document.deleteMany(),
    prisma.newsArticleTag.deleteMany(),
    prisma.newsTag.deleteMany(),
    prisma.newsArticle.deleteMany(),
    prisma.emergencyContact.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.featureFlag.deleteMany(),
    prisma.uiComponent.deleteMany(),
    prisma.pageTheme.deleteMany(),
    prisma.wardSetting.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.userSettings.deleteMany(),
    prisma.user.deleteMany(),
    prisma.ward.deleteMany(),
    prisma.district.deleteMany(),
    prisma.province.deleteMany(),
  ])

  console.log('✅ Cleaned existing data')

  // 1. Create Provinces
  const hcm = await prisma.province.create({
    data: {
      name: 'Thành phố Hồ Chí Minh',
      code: 'HCM',
    },
  })

  const hanoi = await prisma.province.create({
    data: {
      name: 'Thành phố Hà Nội',
      code: 'HN',
    },
  })

  console.log('✅ Created provinces')

  // 2. Create Districts
  const quan1 = await prisma.district.create({
    data: {
      name: 'Quận 1',
      code: 'Q1',
      provinceId: hcm.id,
    },
  })

  const quan3 = await prisma.district.create({
    data: {
      name: 'Quận 3',
      code: 'Q3',
      provinceId: hcm.id,
    },
  })

  const hoanKiem = await prisma.district.create({
    data: {
      name: 'Hoàn Kiếm',
      code: 'HK',
      provinceId: hanoi.id,
    },
  })

  console.log('✅ Created districts')

  // 3. Create Wards
  const benNghe = await prisma.ward.create({
    data: {
      name: 'Phường Bến Nghé',
      code: 'BN',
      districtId: quan1.id,
      provinceId: hcm.id,
      contactInfo: {
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        hotline: '0281234567',
        email: 'bennhe@hcm.gov.vn',
        website: 'https://bennhe.hcm.gov.vn',
        workingHours: '7:30 - 11:30, 13:30 - 17:00',
      },
      settings: {
        features_enabled: ['news', 'documents', 'feedback', 'contacts'],
        default_language: 'vi',
      },
    },
  })

  const benThanh = await prisma.ward.create({
    data: {
      name: 'Phường Bến Thành',
      code: 'BT',
      districtId: quan1.id,
      provinceId: hcm.id,
      contactInfo: {
        address: '456 Lê Lợi, Quận 1, TP.HCM',
        hotline: '0287654321',
        email: 'benthanh@hcm.gov.vn',
      },
    },
  })

  console.log('✅ Created wards')

  // 4. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bennhe.gov.vn',
      name: 'Trần Văn Admin',
      role: 'admin',
      wardId: benNghe.id,
      isActive: true,
    },
  })

  await prisma.userSettings.create({
    data: { userId: admin.id },
  })

  // 5. Create Staff User
  const staff = await prisma.user.create({
    data: {
      email: 'staff@bennhe.gov.vn',
      name: 'Nguyễn Thị Staff',
      role: 'staff',
      wardId: benNghe.id,
      isActive: true,
    },
  })

  await prisma.userSettings.create({
    data: { userId: staff.id },
  })

  // 6. Create Citizen Users
  const citizen1 = await prisma.user.create({
    data: {
      zaloId: 'zalo123456',
      name: 'Lê Văn A',
      phoneNumber: '0901234567',
      wardId: benNghe.id,
      role: 'citizen',
    },
  })

  await prisma.userSettings.create({
    data: { userId: citizen1.id },
  })

  const citizen2 = await prisma.user.create({
    data: {
      zaloId: 'zalo789012',
      name: 'Phạm Thị B',
      phoneNumber: '0907654321',
      wardId: benNghe.id,
      role: 'citizen',
    },
  })

  await prisma.userSettings.create({
    data: { userId: citizen2.id },
  })

  console.log('✅ Created users')

  // 7. Create Emergency Contacts
  await prisma.emergencyContact.createMany({
    data: [
      {
        wardId: benNghe.id,
        title: 'Công An Phường',
        phoneNumber: '0281234567',
        icon: 'zi-shield',
        color: '#EF4444',
        description: 'Liên hệ khi cần hỗ trợ an ninh',
        displayOrder: 1,
      },
      {
        wardId: benNghe.id,
        title: 'Y Tế Cấp Cứu',
        phoneNumber: '115',
        icon: 'zi-heart',
        color: '#10B981',
        description: 'Gọi cấp cứu y tế khẩn cấp',
        displayOrder: 2,
      },
      {
        wardId: benNghe.id,
        title: 'Văn Phòng Phường',
        phoneNumber: '0287654321',
        icon: 'zi-call',
        color: '#3B82F6',
        description: 'Liên hệ văn phòng phường',
        displayOrder: 3,
      },
    ],
  })

  console.log('✅ Created emergency contacts')

  // 8. Create Contacts
  await prisma.contact.createMany({
    data: [
      {
        wardId: benNghe.id,
        name: 'Trần Văn C',
        position: 'Trưởng Công An Phường',
        department: 'cong_an',
        phoneNumber: '0901111111',
        email: 'congan@bennhe.gov.vn',
        officeLocation: 'Tầng 1, Văn phòng UBND',
        workingHours: '7:30 - 16:30',
        isEmergency: true,
        displayOrder: 1,
      },
      {
        wardId: benNghe.id,
        name: 'Nguyễn Thị D',
        position: 'Trưởng Phòng Y Tế',
        department: 'y_te',
        phoneNumber: '0902222222',
        email: 'yte@bennhe.gov.vn',
        officeLocation: 'Tầng 2, Văn phòng UBND',
        workingHours: '7:30 - 16:30',
        displayOrder: 2,
      },
      {
        wardId: benNghe.id,
        name: 'Lê Văn E',
        position: 'Trưởng Phòng Văn Hóa',
        department: 'van_hoa',
        phoneNumber: '0903333333',
        officeLocation: 'Tầng 3, Văn phòng UBND',
        displayOrder: 3,
      },
    ],
  })

  console.log('✅ Created contacts')

  // 9. Create News Articles
  const news1 = await prisma.newsArticle.create({
    data: {
      wardId: benNghe.id,
      title: 'Thông báo lịch tiêm chủng miễn phí cho trẻ em',
      slug: 'thong-bao-lich-tiem-chung-mien-phi-cho-tre-em',
      summary: 'UBND Phường tổ chức chương trình tiêm chủng miễn phí cho trẻ em dưới 5 tuổi từ ngày 15-20/12',
      content: `
<h2>Thông tin chương trình</h2>
<p>UBND Phường Bến Nghé thông báo lịch tiêm chủng miễn phí cho trẻ em dưới 5 tuổi.</p>
<p><strong>Thời gian:</strong> 15-20/12/2024</p>
<p><strong>Địa điểm:</strong> Trạm Y tế Phường</p>
<p><strong>Giấy tờ cần mang:</strong></p>
<ul>
  <li>Giấy khai sinh của trẻ</li>
  <li>Sổ tiêm chủng</li>
  <li>CMND/CCCD của phụ huynh</li>
</ul>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
      category: 'thong_bao',
      authorId: admin.id,
      isFeatured: true,
      isPinned: true,
      viewCount: 152,
      publishedAt: new Date(),
    },
  })

  const news2 = await prisma.newsArticle.create({
    data: {
      wardId: benNghe.id,
      title: 'Hội nghị triển khai chính sách mới về quản lý đất đai',
      slug: 'hoi-nghi-trien-khai-chinh-sach-moi-ve-quan-ly-dat-dai',
      summary: 'Phường tổ chức hội nghị phổ biến chính sách mới về quản lý đất đai',
      content: 'Nội dung hội nghị...',
      imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
      category: 'chinh_sach',
      authorId: admin.id,
      isFeatured: true,
      viewCount: 89,
      publishedAt: new Date(),
    },
  })

  const news3 = await prisma.newsArticle.create({
    data: {
      wardId: benNghe.id,
      title: 'Lễ hội truyền thống đầu xuân Ất Tỵ 2025',
      slug: 'le-hoi-truyen-thong-dau-xuan-at-ty-2025',
      summary: 'Lễ hội diễn ra vào ngày 25/01/2025 tại Công viên 23/9',
      content: 'Chi tiết lễ hội...',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      category: 'su_kien',
      authorId: staff.id,
      viewCount: 234,
      publishedAt: new Date(),
    },
  })

  console.log('✅ Created news articles')

  // 10. Create Documents
  const doc1 = await prisma.document.create({
    data: {
      wardId: benNghe.id,
      title: 'Hướng dẫn làm giấy khai sinh cho trẻ em',
      slug: 'huong-dan-lam-giay-khai-sinh-cho-tre-em',
      description: 'Thủ tục đăng ký khai sinh cho trẻ em dưới 30 ngày tuổi',
      category: 'ho_tich',
      department: 'Phòng Tư pháp - Hộ tịch',
      processingTime: '3-5 ngày làm việc',
      fee: 'Miễn phí',
      viewCount: 456,
      steps: {
        create: [
          {
            stepOrder: 1,
            title: 'Chuẩn bị hồ sơ',
            description: 'Chuẩn bị đầy đủ giấy tờ theo yêu cầu',
            estimatedTime: '1 ngày',
          },
          {
            stepOrder: 2,
            title: 'Nộp hồ sơ',
            description: 'Nộp hồ sơ tại Bộ phận một cửa',
            location: 'Tầng 1, Văn phòng UBND',
            estimatedTime: '30 phút',
          },
          {
            stepOrder: 3,
            title: 'Nhận kết quả',
            description: 'Nhận giấy khai sinh sau 3-5 ngày',
            location: 'Tầng 1, Văn phòng UBND',
            estimatedTime: '15 phút',
          },
        ],
      },
      requiredDocs: {
        create: [
          { name: 'Giấy chứng sinh do bệnh viện cấp', isRequired: true },
          { name: 'CMND/CCCD của bố mẹ', isRequired: true },
          { name: 'Giấy chứng nhận kết hôn', isRequired: true },
          { name: 'Sổ hộ khẩu', isRequired: false, notes: 'Nếu có' },
        ],
      },
      forms: {
        create: [
          {
            name: 'Tờ khai đăng ký khai sinh',
            fileType: 'pdf',
            fileUrl: '/forms/to-khai-dang-ky-khai-sinh.pdf',
            fileSize: 245678,
          },
        ],
      },
    },
  })

  const doc2 = await prisma.document.create({
    data: {
      wardId: benNghe.id,
      title: 'Thủ tục cấp giấy chứng nhận tạm trú',
      slug: 'thu-tuc-cap-giay-chung-nhan-tam-tru',
      description: 'Hướng dẫn làm giấy tạm trú cho người ngoại tỉnh',
      category: 'giay_to_ca_nhan',
      department: 'Công An Phường',
      processingTime: '7 ngày làm việc',
      fee: '50,000 VNĐ',
      viewCount: 321,
      steps: {
        create: [
          {
            stepOrder: 1,
            title: 'Chuẩn bị hồ sơ',
            description: 'Chuẩn bị CMND, hợp đồng thuê nhà',
            estimatedTime: '1 ngày',
          },
          {
            stepOrder: 2,
            title: 'Nộp hồ sơ tại Công An Phường',
            location: 'Công An Phường',
            estimatedTime: '30 phút',
          },
        ],
      },
    },
  })

  console.log('✅ Created documents')

  // 11. Create Feedback
  const feedback1 = await prisma.feedbackSubmission.create({
    data: {
      wardId: benNghe.id,
      userId: citizen1.id,
      category: 'ha_tang',
      title: 'Đường trước nhà bị hư hỏng',
      description: 'Đường Nguyễn Huệ đoạn số 123 bị nứt và lún nhiều, mưa là ngập nước. Mong phường sửa chữa sớm.',
      locationLat: 10.7769,
      locationLng: 106.7009,
      locationAddress: '123 Nguyễn Huệ, P.Bến Nghé, Q.1',
      status: 'in_progress',
      priority: 'high',
      isUrgent: true,
      assignedTo: staff.id,
      photos: {
        create: [
          {
            photoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
            uploadOrder: 0,
          },
        ],
      },
    },
  })

  await prisma.feedbackHistory.create({
    data: {
      feedbackId: feedback1.id,
      newStatus: 'in_progress',
      message: 'Đã tiếp nhận và đang xử lý',
      changedBy: staff.id,
    },
  })

  const feedback2 = await prisma.feedbackSubmission.create({
    data: {
      wardId: benNghe.id,
      userId: citizen2.id,
      category: 'moi_truong',
      title: 'Rác thải chưa được thu gom',
      description: 'Khu vực đường số 5 rác thải tồn đọng nhiều ngày chưa được thu gom',
      status: 'resolved',
      responseMessage: 'Đã phối hợp với Công ty Môi trường thu gom xong. Cảm ơn bạn đã phản ánh.',
      resolvedAt: new Date(),
    },
  })

  console.log('✅ Created feedback')

  // 12. Create Page Themes
  await prisma.pageTheme.create({
    data: {
      wardId: benNghe.id,
      pageKey: 'home',
      themeConfig: {
        hero: {
          backgroundGradient: ['#FF6B35', '#F7931E'],
          logoUrl: '/assets/ward-logo.png',
          title: 'Phường Bến Nghé',
          subtitle: 'Kết nối chính quyền - Phục vụ nhân dân',
        },
        colors: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          accent: '#00D9FF',
        },
        layout: 'grid',
        sections: {
          showEmergencyBanner: true,
          showQuickActions: true,
          showFeaturedNews: true,
        },
      },
      isActive: true,
    },
  })

  console.log('✅ Created page themes')

  // 13. Create Feature Flags
  await prisma.featureFlag.createMany({
    data: [
      {
        wardId: benNghe.id,
        featureKey: 'news_module',
        isEnabled: true,
        config: {},
      },
      {
        wardId: benNghe.id,
        featureKey: 'documents_module',
        isEnabled: true,
        config: {},
      },
      {
        wardId: benNghe.id,
        featureKey: 'feedback_module',
        isEnabled: true,
        config: { maxPhotos: 3, requireLocation: false },
      },
      {
        wardId: benNghe.id,
        featureKey: 'contacts_module',
        isEnabled: true,
        config: {},
      },
    ],
  })

  console.log('✅ Created feature flags')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Provinces: 2 (HCM, Hanoi)`)
  console.log(`- Districts: 3 (Q1, Q3, Hoàn Kiếm)`)
  console.log(`- Wards: 2 (Bến Nghé, Bến Thành)`)
  console.log(`- Users: 4 (1 admin, 1 staff, 2 citizens)`)
  console.log(`- News: 3 articles`)
  console.log(`- Documents: 2 procedures`)
  console.log(`- Contacts: 3 contacts + 3 emergency`)
  console.log(`- Feedback: 2 submissions`)
  console.log('\n👤 Admin Login:')
  console.log(`   Email: admin@bennhe.gov.vn`)
  console.log(`   (Use OTP login)`)
  console.log('\n👤 Staff Login:')
  console.log(`   Email: staff@bennhe.gov.vn`)
  console.log(`   (Use OTP login)`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
