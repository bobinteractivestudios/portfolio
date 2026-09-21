import styles from "./MarginContact.module.css";
import { SHOW_PERSONAL_INFO } from "@/lib/personalInfo";

export default function MarginContact() {
  if (!SHOW_PERSONAL_INFO) return null;

  return (
    <div className={styles.margin}>
      <a href="tel:+31651775569">tel: 0651775569</a>
      <a href="mailto:bob@van-boekel.nl">mail: bob@van-boekel.nl</a>
    </div>
  );
}
