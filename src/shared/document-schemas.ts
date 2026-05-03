import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// 1. パスポート (Passport)
export const PassportSchema = z.object({
  type: z.string().describe("ドキュメントタイプ (Type)"),
  countryCode: z.string().describe("発行国コード (Country Code)"),
  passportNo: z.string().describe("パスポート番号 (Passport No.)"),
  surname: z.string().describe("姓 (Surname)"),
  otherNames: z.string().describe("名 (Other Names)"),
  nationality: z.string().describe("国籍 (Nationality)"),
  dateOfBirth: z.string().describe("生年月日 (Date of Birth) YYYY-MM-DD"),
  sex: z.string().describe("性別 (Sex)"),
  placeOfBirth: z.string().describe("出生地 (Place of Birth)"),
  dateOfIssue: z.string().describe("発行日 (Date of Issue) YYYY-MM-DD"),
  dateOfExpiry: z.string().describe("有効期限 (Date of Expiry) YYYY-MM-DD"),
  mrzCode: z.string().describe("MRZコード (Machine Readable Zone 全文字列)")
});

// 2. YMCA日本語学校入学願書 (Application for Admission)
export const AdmissionApplicationSchema = z.object({
  schoolName: z.string().describe("申請校名 / 入学希望コース"),
  personalInfo: z.object({
    nameAlphabet: z.string().describe("氏名(アルファベット)"),
    nameKatakana: z.string().describe("氏名(カタカナ)"),
    sex: z.string().describe("性別"),
    dateOfBirth: z.string().describe("生年月日 YYYY-MM-DD"),
    age: z.string().describe("年齢"),
    spouse: z.string().describe("配偶者の有無"),
    nationality: z.string().describe("国籍"),
    placeOfBirth: z.string().describe("出生地"),
    language: z.string().describe("使用言語"),
    currentAddress: z.string().describe("現住所"),
    phoneNumber: z.string().describe("電話番号"),
    mobileNumber: z.string().describe("携帯電話番号")
  }),
  passportInfo: z.object({
    passportNo: z.string().describe("パスポート番号"),
    dateOfIssue: z.string().describe("発行日"),
    dateOfExpiry: z.string().describe("有効期限"),
    visaApplicationPlace: z.string().describe("査証申請予定地")
  }),
  history: z.object({
    criminalRecord: z.string().describe("犯罪歴の有無"),
    deportationRecord: z.string().describe("退去強制・出国命令歴の有無"),
    pastVisaApplication: z.string().describe("過去の在留資格申請歴"),
    pastEntryRecord: z.string().describe("過去の出入国歴の有無"),
    familyInJapan: z.string().describe("在日親族の有無")
  }),
  educationHistory: z.array(z.object({
    schoolName: z.string().describe("学校名"),
    address: z.string().describe("所在地"),
    entryDate: z.string().describe("入学年月 YYYY-MM"),
    graduationDate: z.string().describe("卒業年月 YYYY-MM"),
    yearsOfStudy: z.string().describe("修学年数")
  })).describe("学歴リスト"),
  employmentHistory: z.array(z.object({
    companyName: z.string().describe("勤務先名"),
    address: z.string().describe("所在地"),
    phoneNumber: z.string().describe("電話番号"),
    period: z.string().describe("在職期間"),
    occupation: z.string().describe("職種")
  })).describe("職歴リスト"),
  militaryService: z.string().describe("兵役の有無"),
  jlptHistory: z.array(z.object({
    testName: z.string().describe("試験名"),
    status: z.string().describe("受験状況(受験済/予定/未受験)"),
    date: z.string().describe("年月 YYYY-MM"),
    level: z.string().describe("級"),
    result: z.string().describe("結果"),
    score: z.string().describe("点数")
  })).describe("日本語能力試験歴"),
  japaneseStudyHistory: z.array(z.object({
    institutionName: z.string().describe("機関名"),
    address: z.string().describe("住所"),
    phoneNumber: z.string().describe("電話番号"),
    period: z.string().describe("学習期間(開始〜終了)"),
    studyHours: z.string().describe("学習時間数")
  })).describe("日本語学習歴"),
  sponsorInfo: z.object({
    name: z.string().describe("氏名"),
    relation: z.string().describe("続柄"),
    homeAddress: z.string().describe("自宅住所"),
    phoneNumber: z.string().describe("電話番号"),
    companyName: z.string().describe("勤務先名称"),
    occupation: z.string().describe("職種"),
    workPhoneNumber: z.string().describe("職場電話番号"),
    workAddress: z.string().describe("勤務先住所"),
    annualIncome: z.string().describe("年収")
  }),
  familyList: z.array(z.object({
    name: z.string().describe("氏名"),
    relation: z.string().describe("続柄"),
    dateOfBirth: z.string().describe("生年月日"),
    occupation: z.string().describe("職業"),
    address: z.string().describe("住所"),
    phoneNumber: z.string().describe("電話番号")
  })).describe("家族リスト"),
  emergencyContact: z.object({
    homeCountry: z.object({
      name: z.string(),
      relation: z.string(),
      address: z.string(),
      phoneNumber: z.string()
    }).describe("本国の緊急連絡先"),
    japan: z.object({
      name: z.string(),
      relation: z.string(),
      address: z.string(),
      phoneNumber: z.string()
    }).describe("日本の緊急連絡先")
  }),
  futurePlan: z.string().describe("卒業後の予定: 進学/就職/帰国等")
});

// 3. 志望理由書 (Reason for studying in Japan)
export const ReasonForStudyingSchema = z.object({
  applicantName: z.string().describe("申請者氏名"),
  date: z.string().describe("作成日付"),
  reasonText: z.string().describe("志望理由テキスト (本文全文)")
});

// 4. 経費支弁書 (Payment of Expenses)
export const PaymentOfExpensesSchema = z.object({
  applicantInfo: z.object({
    nationality: z.string().describe("国籍"),
    name: z.string().describe("氏名"),
    dateOfBirth: z.string().describe("生年月日"),
    sex: z.string().describe("性別")
  }),
  expenses: z.object({
    tuitionFirstYear: z.string().describe("学費(1年目)"),
    tuitionNextYear: z.string().describe("学費(次年度)"),
    housing6Months: z.string().describe("居住費(6ヶ月)"),
    livingMonthly: z.string().describe("生活費(月額)")
  }),
  paymentMethod: z.string().describe("支払方法: 海外送金、本人持参(金額)など"),
  sponsorInfo: z.object({
    signatureDate: z.string().describe("署名日"),
    sponsorName: z.string().describe("署名者氏名"),
    relationToApplicant: z.string().describe("申請者との続柄"),
    address: z.string().describe("住所")
  })
});

// 5. 申請者の出生証明書 (Register of Birth - Student)
export const RegisterOfBirthStudentSchema = z.object({
  registrationNo: z.string().describe("登録番号 (Registration B 1 / No.)"),
  districtDivision: z.string().describe("管轄地区・管区 (District / Division)"),
  dateOfBirth: z.string().describe("出生年月日"),
  placeOfBirth: z.string().describe("出生地"),
  applicantName: z.string().describe("申請者氏名"),
  sex: z.string().describe("性別"),
  fatherInfo: z.object({
    fullName: z.string().describe("フルネーム"),
    dateOfBirth: z.string().describe("生年月日"),
    placeOfBirth: z.string().describe("出生地"),
    ethnicity: z.string().describe("民族")
  }),
  motherInfo: z.object({
    fullName: z.string().describe("フルネーム"),
    dateOfBirth: z.string().describe("生年月日"),
    placeOfBirth: z.string().describe("出生地"),
    ethnicity: z.string().describe("民族"),
    age: z.string().describe("年齢")
  }),
  parentsMarriageStatus: z.string().describe("両親の婚姻状況"),
  declarantInfo: z.object({
    name: z.string().describe("氏名"),
    residence: z.string().describe("居住地"),
    capacity: z.string().describe("資格(父など)")
  }),
  registrationDate: z.string().describe("登録日")
});

// 6. 児童・生徒個人記録簿 (Pupil's Record Sheet)
export const PupilRecordSheetSchema = z.object({
  certificateNo: z.string().describe("証明書番号 (No.- A)"),
  studentIdentityNo: z.string().describe("学籍番号 (Student Identity Number)"),
  name: z.string().describe("氏名 (フルネームおよびイニシャル付き)"),
  dateOfBirth: z.string().describe("生年月日"),
  religion: z.string().describe("宗教"),
  parentName: z.string().describe("保護者の氏名"),
  parentAddress: z.string().describe("保護者の住所"),
  schoolName: z.string().describe("学校名"),
  admissionDate: z.string().describe("入学日"),
  admissionNo: z.string().describe("入学許可番号"),
  leavingDate: z.string().describe("離校日"),
  causeOfLeaving: z.string().describe("離校理由 (Cause of leaving)"),
  lastStandard: z.string().describe("最終修了学年 (The last Standard)"),
  medium: z.string().describe("教授言語 (Medium)"),
  subjectStudies: z.string().describe("最終履修科目 (Subject studies)"),
  conduct: z.string().describe("素行評価 (Conduct)"),
  issueDate: z.string().describe("証明書発行日")
});

// 7. G.C.E. (O/L) 試験公式成績表
export const GCE_OL_Schema = z.object({
  certificateNo: z.string().describe("証明書シリアル番号 / 参照番号 (My Ref.)"),
  issueDate: z.string().describe("発行日"),
  candidateName: z.string().describe("受験者氏名"),
  year: z.string().describe("受験年"),
  indexNo: z.string().describe("受験番号 (Index Number)"),
  grades: z.array(z.object({
    subject: z.string().describe("科目名"),
    grade: z.string().describe("評価Grade")
  })).describe("成績リスト")
});

// 8. G.C.E. (A/L) 試験公式成績表
export const GCE_AL_Schema = z.object({
  certificateNo: z.string().describe("証明書シリアル番号 / 参照番号 (My Ref.)"),
  issueDate: z.string().describe("発行日"),
  candidateName: z.string().describe("受験者氏名"),
  year: z.string().describe("受験年"),
  indexNo: z.string().describe("受験番号 (Index Number)"),
  grades: z.array(z.object({
    subject: z.string().describe("科目名"),
    grade: z.string().describe("評価Grade")
  })).describe("成績リスト"),
  commonGeneralTestMarks: z.string().describe("一般テストマーク (Common General Test Marks)"),
  zScore: z.string().describe("Zスコア (Z-Score Marks)")
});

// 9. NVQ 国家資格証明書 (Automobile Mechanic) & 10. NVQ Automobile Electrician
export const NVQCertificateSchema = z.object({
  qualificationName: z.string().describe("資格名称"),
  nvqLevel: z.string().describe("NVQレベル"),
  name: z.string().describe("氏名"),
  awardingInstitute: z.string().describe("授与機関名"),
  certificateNo: z.string().describe("証明書番号 (Certificate Number)"),
  effectiveDate: z.string().describe("発効日 (Effective date)"),
  nicNumber: z.string().describe("国民ID番号 (NIC Number)")
});

// 11. 工科カレッジ修了証 (Wayamba Technical College Certificate)
export const TechnicalCollegeCertificateSchema = z.object({
  tvecRegistrationNo: z.string().describe("TVEC登録番号"),
  name: z.string().describe("氏名"),
  courseName: z.string().describe("修了コース名"),
  grade: z.string().describe("成績評価 (Grade)"),
  registrationNo: z.string().describe("登録番号"),
  certificateNo: z.string().describe("証明書番号"),
  issueDate: z.string().describe("授与日")
});

// 12. 工科カレッジ履修証明状 (To Whom It May Concern)
export const TechnicalCollegeLetterSchema = z.object({
  issueDate: z.string().describe("発行日"),
  name: z.string().describe("対象者氏名"),
  address: z.string().describe("住所"),
  courseName: z.string().describe("履修コース名"),
  period: z.string().describe("在籍期間 (開始年月日〜終了年月)"),
  subjects: z.array(z.string()).describe("履修科目リスト")
});

// 13. 在職証明書 (Employment Letter)
export const EmploymentLetterSchema = z.object({
  companyName: z.string().describe("発行会社名"),
  companyAddress: z.string().describe("住所"),
  companyPhone: z.string().describe("電話番号"),
  issueDate: z.string().describe("発行日"),
  employeeName: z.string().describe("従業員氏名"),
  nicNumber: z.string().describe("国民ID番号 (NIC)"),
  position: z.string().describe("役職"),
  employmentPeriod: z.string().describe("雇用期間 (開始日〜現在)"),
  managerName: z.string().describe("マネージャー氏名 (署名者)")
});

// 14. 日本語学習証明書 (STUDENT MATE)
export const JapaneseStudyCertificateSchema = z.object({
  instituteName: z.string().describe("発行機関名"),
  instituteAddress: z.string().describe("住所"),
  institutePhone: z.string().describe("電話番号"),
  studentName: z.string().describe("学習者氏名"),
  coursePeriod: z.string().describe("コース期間 (開始日〜終了日)"),
  totalHours: z.string().describe("総学習時間"),
  courseName: z.string().describe("コース名"),
  textbook: z.string().describe("使用教科書"),
  level: z.string().describe("レベル"),
  holidays: z.array(z.string()).describe("休日リスト"),
  attendanceCount: z.string().describe("出席回数"),
  attendanceRate: z.string().describe("出席率"),
  issueDate: z.string().describe("発行日")
});

// 15. 母親の出生証明書 (Register of Birth - Mother)
// (Schema structure is identical to Student's, just different context, reusing structure)
export const RegisterOfBirthMotherSchema = RegisterOfBirthStudentSchema;

// 16. 財務報告書・監査報告書 (Financial Statement)
export const FinancialStatementSchema = z.object({
  auditingFirm: z.string().describe("作成監査法人名"),
  businessName: z.string().describe("事業名称"),
  industry: z.string().describe("業種"),
  ownerName: z.string().describe("所有者氏名"),
  ownerAddress: z.string().describe("住所"),
  profitAndLoss: z.array(z.object({
    year: z.string(),
    salesIncome: z.string().describe("売上高(Sales Income)"),
    cogs: z.string().describe("売上原価"),
    grossProfit: z.string().describe("粗利益"),
    expensesBeforeTax: z.string().describe("税引前費用"),
    netEarn: z.string().describe("純利益(Net Earn)")
  })).describe("損益計算書 (直近3年分)"),
  balanceSheet: z.array(z.object({
    year: z.string(),
    cashBalance: z.string().describe("所有者口座残高"),
    totalAssets: z.string().describe("資産合計(Total Assets)"),
    totalLiabilities: z.string().describe("負債合計"),
    netWealth: z.string().describe("純資産(Net Wealth)")
  })).describe("貸借対照表 (直近3年分)"),
  ratios: z.object({
    currentRatio: z.string().describe("流動比率"),
    roce: z.string().describe("投下資本利益率(ROCE)")
  }),
  taxInfo: z.object({
    statutoryIncome: z.string().describe("法定所得"),
    exemptAmount: z.string().describe("免税額"),
    taxableIncome: z.string().describe("課税所得"),
    taxPayable: z.string().describe("未払税金(Tax Payable)")
  })
});

// 17. 個人事業登録証明書 (Certificate of Registration of an Individual Business)
export const BusinessRegistrationSchema = z.object({
  certificateNo: z.string().describe("証明書番号"),
  businessName: z.string().describe("事業名 (The Business Name)"),
  generalNature: z.string().describe("事業内容 (The General Nature of the Business)"),
  principalPlace: z.string().describe("事業所所在地 (The Principal Place of Business)"),
  commencementDate: z.string().describe("事業開始日"),
  ownerName: z.string().describe("所有者の氏名 (The Individual)"),
  ownerNationality: z.string().describe("所有者の国籍"),
  registrationDate: z.string().describe("登録日"),
  issueAuthority: z.string().describe("発行機関")
});

// 18. 銀行残高証明書 (Bank Balance Confirmation)
export const BankBalanceConfirmationSchema = z.object({
  bankName: z.string().describe("銀行名"),
  branchName: z.string().describe("支店名"),
  issueDate: z.string().describe("発行日付"),
  accountHolderName: z.string().describe("口座名義人氏名"),
  accountHolderAddress: z.string().describe("住所"),
  nicNumber: z.string().describe("国民ID番号 (NIC)"),
  accountNo: z.string().describe("口座番号"),
  accountType: z.string().describe("口座の種類 (Savings Account等)"),
  openDate: z.string().describe("口座開設日"),
  balanceAsAt: z.string().describe("確認日時点の残高金額 (Balance as at)")
});

// 19. 銀行取引明細/通帳 (Bank Statement / Passbook)
export const BankStatementSchema = z.object({
  accountNo: z.string().describe("口座番号"),
  accountHolderName: z.string().describe("口座名義人氏名"),
  nicNumber: z.string().describe("国民ID番号 (NIC)"),
  transactions: z.array(z.object({
    date: z.string().describe("日付 (DATE)"),
    details: z.string().describe("摘要/詳細 (DETAILS)"),
    withdrawals: z.string().describe("引出額 (WITHDRAWALS)"),
    deposits: z.string().describe("預入額 (DEPOSITS)"),
    balance: z.string().describe("残高 (BALANCE)")
  })).describe("明細レコードリスト")
});

// マップ定義：ドキュメントタイプからスキーマへのマッピング
export const DocumentSchemas = {
  passport: PassportSchema,
  admission_application: AdmissionApplicationSchema,
  reason_for_studying: ReasonForStudyingSchema,
  payment_of_expenses: PaymentOfExpensesSchema,
  register_of_birth_student: RegisterOfBirthStudentSchema,
  pupil_record_sheet: PupilRecordSheetSchema,
  gce_ol: GCE_OL_Schema,
  gce_al: GCE_AL_Schema,
  nvq_mechanic: NVQCertificateSchema,
  nvq_electrician: NVQCertificateSchema,
  wayamba_certificate: TechnicalCollegeCertificateSchema,
  wayamba_letter: TechnicalCollegeLetterSchema,
  employment_letter: EmploymentLetterSchema,
  japanese_study_cert: JapaneseStudyCertificateSchema,
  register_of_birth_mother: RegisterOfBirthMotherSchema,
  financial_statement: FinancialStatementSchema,
  business_registration: BusinessRegistrationSchema,
  bank_balance_confirmation: BankBalanceConfirmationSchema,
  bank_statement: BankStatementSchema
} as const;

export type DocumentType = keyof typeof DocumentSchemas;

// AIシステムプロンプト等へ渡すためのJSON Schema取得ヘルパー
export function getJsonSchemaForDocument(type: DocumentType) {
  return zodToJsonSchema(DocumentSchemas[type] as any, type);
}
