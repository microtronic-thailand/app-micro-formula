export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // เมื่อสร้าง Table จริงแล้ว เราจะ gen ทับส่วนนี้
        }
        Views: {
            [_: string]: {
                Row: {
                    [key: string]: Json
                }
            }
        }
        Functions: {
            [_: string]: {
                Args: {
                    [key: string]: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_: string]: never
        }
    }
}
