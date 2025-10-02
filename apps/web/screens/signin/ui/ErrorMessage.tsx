interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="ml-3 text-red-600">
      <h3 className="text-sm font-medium">로그인 오류</h3>
      <div className="mt-2 text-sm">
        <p>{error}</p>
        <p className="mt-1 text-xs">문제가 지속되면 관리자에게 문의해주세요.</p>
      </div>
    </div>
  );
}
